'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { calculateGroupStandings } from '@/lib/simulator'
import { CheckCircle2, Save, ChevronRight, Trophy, XCircle, Loader2, Medal } from 'lucide-react'

const FASES = [
  { id: 'oitavas', label: 'Top 16', count: 16 },
  { id: 'quartas', label: 'Top 8', count: 8 },
  { id: 'semi', label: 'Top 4', count: 4 },
  { id: 'final', label: 'Finalistas', count: 2 },
  { id: 'podio', label: 'Pódio', count: 3 }, // 1º, 2º e 3º
]

export default function MataMataPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selecoes, setSelecoes] = useState<any[]>([])
  const [classificadasGrupos, setClassificadasGrupos] = useState<any[]>([])
  const [picks, setPicks] = useState<Record<string, string[]>>({ 
    oitavas: [], quartas: [], semi: [], final: [], podio: [] 
  })
  const [realResults, setRealResults] = useState<Record<string, string[]>>({ 
    oitavas: [], quartas: [], semi: [], final: [], terceiro: [], vice: [], campeao: [] 
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return router.push('/login')

        const { data: teams } = await supabase.from('selecoes').select('*')
        const { data: matches } = await supabase.from('jogos').select('*, time_a:time_a_id(*), time_b:time_b_id(*)')
        const { data: groupPicks } = await supabase.from('palpites_jogos').select('*').eq('usuario_id', user.id)

        const mPicks = matches?.map(m => {
          const p = groupPicks?.find(pg => pg.jogo_id === m.id)
          return { ...m, gols_a: p?.gols_a ?? null, gols_b: p?.gols_b ?? null }
        }) || []

        const GRUPOS = ['A','B','C','D','E','F','G','H','I','J','K','L']
        let q: any[] = []
        let t: any[] = []
        GRUPOS.forEach(g => {
          const gT = teams?.filter(item => item.grupo_id === g) || []
          const gM = mPicks.filter(item => item.grupo_id === g)
          if (gT.length > 0) {
            const std = calculateGroupStandings(gT, gM)
            q.push(std[0], std[1])
            if (std[2]) t.push(std[2])
          }
        })
        const final32 = [...q, ...t.sort((a,b) => b.pts - a.pts || b.sg - a.sg).slice(0,8)].filter(Boolean)
        const validIds = final32.map(item => item.id)
        
        setClassificadasGrupos(final32)
        setSelecoes(teams || [])

        const { data: existing } = await supabase.from('palpites_shortlist').select('*').eq('usuario_id', user.id)
        if (existing?.length) {
          let tempPicks: any = { oitavas: [], quartas: [], semi: [], final: [], podio: [] }
          existing.forEach(p => {
            if (['campeao', 'vice', 'terceiro'].includes(p.fase_esperada)) {
               // Armazenamos o ID na ordem: [campeao, vice, terceiro]
               if (p.fase_esperada === 'campeao') tempPicks.podio[0] = p.selecao_id;
               if (p.fase_esperada === 'vice') tempPicks.podio[1] = p.selecao_id;
               if (p.fase_esperada === 'terceiro') tempPicks.podio[2] = p.selecao_id;
            } else {
               tempPicks[p.fase_esperada]?.push(p.selecao_id)
            }
          })
          setPicks(tempPicks)
        }

        setRealResults({
            oitavas: teams?.filter(item => item.passou_oitavas_real).map(item => item.id) || [],
            quartas: teams?.filter(item => item.passou_quartas_real).map(item => item.id) || [],
            semi:    teams?.filter(item => item.passou_semi_real).map(item => item.id) || [],
            final:   teams?.filter(item => item.passou_final_real).map(item => item.id) || [],
            terceiro: teams?.filter(item => item.terceiro_real).map(item => item.id) || [],
            vice:    teams?.filter(item => item.vice_real).map(item => item.id) || [],
            campeao: teams?.filter(item => item.campeao_real).map(item => item.id) || []
        })

      } catch (e) { console.error(e) }
      setLoading(false)
    }
    load()
  }, [])

  const togglePick = (id: string) => {
    const step = FASES[currentStep]
    if (realResults[step.id === 'podio' ? 'campeao' : step.id].length > 0) return;

    if (step.id === 'podio') {
      const currentPodio = [...(picks.podio || [])]
      // Se já está no pódio em qualquer lugar, remove
      const index = currentPodio.indexOf(id)
      if (index !== -1) {
        currentPodio[index] = ""
        setPicks({...picks, podio: currentPodio})
      } else {
        // Adiciona na primeira vaga livre
        const freeSlot = currentPodio.findIndex(v => !v)
        if (freeSlot !== -1) {
          currentPodio[freeSlot] = id
          setPicks({...picks, podio: currentPodio})
        } else if (currentPodio.length < 3) {
          setPicks({...picks, podio: [...currentPodio, id]})
        }
      }
      return
    }

    const list = picks[step.id] || []
    if (list.includes(id)) {
      const newPicks = { ...picks }
      FASES.slice(currentStep).forEach(f => {
        newPicks[f.id] = f.id === 'podio' ? [] : newPicks[f.id].filter(pid => pid !== id)
      })
      setPicks(newPicks)
    } else if (list.length < step.count) {
      setPicks({ ...picks, [step.id]: [...list, id] })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('palpites_shortlist').delete().eq('usuario_id', user?.id)
    
    const payload: any[] = []
    
    // Salva fases normais
    Object.entries(picks).forEach(([f, ids]) => {
      if (f !== 'podio') {
        ids.forEach(id => payload.push({ usuario_id: user?.id, selecao_id: id, fase_esperada: f }))
      }
    })

    // Salva Pódio com os nomes corretos para o Trigger
    if (picks.podio[0]) payload.push({ usuario_id: user?.id, selecao_id: picks.podio[0], fase_esperada: 'campeao' })
    if (picks.podio[1]) payload.push({ usuario_id: user?.id, selecao_id: picks.podio[1], fase_esperada: 'vice' })
    if (picks.podio[2]) payload.push({ usuario_id: user?.id, selecao_id: picks.podio[2], fase_esperada: 'terceiro' })

    await supabase.from('palpites_shortlist').insert(payload)
    
    if (currentStep === 4 && picks.podio.filter(Boolean).length === 3) {
        setShowModal(true)
    } else {
        alert('Mata-mata salvo! 🏆')
    }
    setSaving(false)
  }

  const available = currentStep === 0 ? classificadasGrupos : 
                    currentStep === 4 ? selecoes.filter(s => picks.semi.includes(s.id)) : // Pódio sai dos 4 da semi
                    selecoes.filter(s => picks[FASES[currentStep - 1].id]?.includes(s.id))

  return (
    <main className="max-w-md mx-auto bg-gray-50 min-h-screen pb-44 flex flex-col relative">
      <nav className="flex bg-[#001533] text-white sticky top-0 z-50 shadow-lg">
        {FASES.map((f, i) => (
          <button key={f.id} onClick={() => i <= currentStep && setCurrentStep(i)} 
            className={`flex-1 py-4 text-[8px] font-black uppercase border-b-4 transition-all 
              ${currentStep === i ? 'border-yellow-400 text-yellow-400' : i < currentStep ? 'border-green-400 text-green-400' : 'border-transparent opacity-30'}`}>
            {f.label}
          </button>
        ))}
      </nav>

      <div className="p-4 flex-1">
        <header className="py-6 text-center">
            <h1 className="text-2xl font-black text-[#003366] uppercase italic tracking-tighter">
                {FASES[currentStep].label}
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">
                {currentStep === 4 ? "Defina a ordem do pódio" : `Selecione ${FASES[currentStep].count} seleções`}
            </p>
        </header>

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
          {available.map((s, idx) => {
            const isSelected = picks[FASES[currentStep].id]?.includes(s.id)
            const podioPos = picks.podio?.indexOf(s.id)
            
            // Lógica de cores para o Pódio
            let phaseId = FASES[currentStep].id
            if (phaseId === 'podio') {
                if (podioPos === 0) phaseId = 'campeao'
                else if (podioPos === 1) phaseId = 'vice'
                else if (podioPos === 2) phaseId = 'terceiro'
            }

            const phaseRealResults = realResults[phaseId] || []
            const phaseIsFinished = phaseRealResults.length > 0
            const acertou = isSelected && phaseIsFinished && phaseRealResults.includes(s.id)
            const errou = isSelected && phaseIsFinished && !phaseRealResults.includes(s.id)
            const pendente = isSelected && !phaseIsFinished

            return (
              <button key={s.id} onClick={() => togglePick(s.id)} 
                className={`w-full flex items-center justify-between p-4 border-b last:border-0 transition-all
                  ${acertou ? 'bg-green-50 border-l-4 border-l-green-500' : 
                    errou ? 'bg-red-50 border-l-4 border-l-red-500 opacity-60' : 
                    pendente ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'bg-white'}`}>
                
                <div className="flex items-center gap-4">
                  <img src={s.bandeira_url} className="w-7 h-5 object-cover rounded shadow-xs" alt="" />
                  <div className="text-left">
                    <span className="font-bold text-sm block">{s.nome}</span>
                    {currentStep === 4 && podioPos !== -1 && (
                        <span className="text-[9px] font-black text-blue-600 uppercase">
                            {podioPos === 0 ? "🥇 1º Lugar" : podioPos === 1 ? "🥈 2º Lugar" : "🥉 3º Lugar"}
                        </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                    {acertou && <CheckCircle2 size={20} className="text-green-600" />}
                    {errou && <XCircle size={20} className="text-red-600" />}
                    {pendente && <CheckCircle2 size={20} className="text-blue-600" fill="white" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <button onClick={handleSave} disabled={saving} className="bg-gray-100 text-[#003366] p-5 rounded-[24px] shadow-xl">
            {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          </button>
          <button
            disabled={picks[FASES[currentStep].id]?.filter(Boolean).length !== FASES[currentStep].count}
            onClick={() => currentStep < 4 ? setCurrentStep(currentStep + 1) : handleSave()}
            className="flex-1 bg-[#003366] text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 disabled:opacity-30"
          >
            {currentStep === 4 ? 'Finalizar 🏆' : 'Próxima Fase'} <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white rounded-[40px] p-8 w-full max-w-sm text-center space-y-6 shadow-2xl border-b-8 border-green-500">
            <Trophy size={48} className="text-yellow-500 mx-auto" />
            <h2 className="text-2xl font-black text-[#003366] uppercase italic tracking-tighter">Palpites Gravados!</h2>
            <p className="text-sm text-gray-500 font-medium">Acompanhe agora os resultados e sua posição no ranking.</p>
            <button onClick={() => router.push('/ranking')} className="w-full bg-[#003366] text-white py-5 rounded-3xl font-black uppercase tracking-widest">Ir para o Ranking</button>
          </div>
        </div>
      )}
    </main>
  )
}