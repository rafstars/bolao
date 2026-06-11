'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Save, ChevronRight, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

const OPCOES_JOGADORES = {
  bola_ouro: ["Kylian Mbappé", "Jude Bellingham", "Vinícius Júnior", "Lamine Yamal", "Lionel Messi","Michael Olise", "Erling Haaland", "Harry Kane", "Neymar", "Raphinha", "Bruno Fernandes", "Julian Alvarez", "Rodri", "Vitinha", "Luis Diaz", "Florian Wirtz", "Jamal Musiala", "Christian Pulisic", "Mohamed Salah", "Enzo Fernandes"],
  artilheiro: ["Kylian Mbappé", "Erling Haaland", "Harry Kane", "Vinícius Júnior", "Cristiano Ronaldo", "	Mikel Oyarzabal", "	Lionel Messi", "Lamine Yamal", "Ousmane Dembele", "Neymar", "Raphinha", "Endrick", "Igor Thiago", "Julian Alvarez", "Lautaro Martinez", "Cody Gakpo", "Romelu Lukaku", "Bukayo Saka", "Michael Olise", "Memphis Depay", "Mohamed Salah", "Nico Williams"],
  luva_ouro: ["Emiliano Martínez", "Thibaut Courtois", "Alisson Becker", "Unai Simon", "Mike Maignan", "Yassine Bounou", "Jordan Pickford", "Manuel Neuer","Ederson", "David Raya", "Diogo Costa", "Bart Verbruggen", "Matt Freese", "Sergio Rochet", "Edouard Mendy", "Zion Suzuki", "Guillermo Ochoa"]
}

const PREMIOS_CONFIG = [
  { id: 'bola_ouro', titulo: 'Bola de Ouro', icon: '⚽' },
  { id: 'artilheiro', titulo: 'Chuteira de Ouro', icon: '👟' },
  { id: 'luva_ouro', titulo: 'Luva de Ouro', icon: '🧤' },
]

export default function PremiosPage() {
  const [palpites, setPalpites] = useState<any>({})
  const [realWinners, setRealWinners] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/login')
    
    const [pRes, rRes] = await Promise.all([
      supabase.from('palpites_premios').select('*').eq('usuario_id', user.id),
      supabase.from('resultados_premios').select('*')
    ])

    if (pRes.data) {
      const pMap: any = {}
      pRes.data.forEach(p => pMap[p.tipo] = p.jogador_nome)
      setPalpites(pMap)
    }
    if (rRes.data) {
      const rMap: any = {}
      rRes.data.forEach(r => rMap[r.tipo] = r.vencedor_nome_real)
      setRealWinners(rMap)
    }
    setLoading(false)
  }

  useEffect(() => { loadData() }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Usuário não autenticado")

      const payload = PREMIOS_CONFIG
        .filter(c => palpites[c.id])
        .map(c => ({
          usuario_id: user.id,
          tipo: c.id,
          jogador_nome: palpites[c.id]
        }))

      const { error } = await supabase.from('palpites_premios').upsert(payload, { onConflict: 'usuario_id, tipo' })
      if (error) throw error
      
      alert('Palpites salvos com sucesso! 🏆')
      await loadData()
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-[#003366] bg-gray-50">
      <Loader2 className="animate-spin mr-2" /> SINCRONIZANDO...
    </div>
  )

  return (
    <main className="max-w-md mx-auto p-4 space-y-6 bg-gray-50 min-h-screen pb-44 flex flex-col relative">
      <header className="text-center py-6">
        <h1 className="text-2xl font-black text-[#003366] uppercase italic tracking-tighter">Prêmios Individuais</h1>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status dos Craques</p>
      </header>

      <div className="space-y-4 flex-1">
        {PREMIOS_CONFIG.map(config => {
          const meuPalpite = palpites[config.id]
          const vencedorReal = realWinners[config.id]
          const encerrado = !!(vencedorReal && vencedorReal !== '')
          const acertou = meuPalpite === vencedorReal
          
          return (
            <div key={config.id} className={`bg-white p-6 rounded-[32px] border-2 transition-all shadow-sm space-y-4
                ${encerrado && acertou ? 'border-green-500 bg-green-50' : 
                  encerrado && !acertou ? 'border-red-500 bg-red-50' : 'border-white'}`}>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 font-black text-[#003366] uppercase text-[10px] tracking-widest">
                  <span className="text-2xl">{config.icon}</span>
                  {config.titulo}
                </div>
                {encerrado && (acertou ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-red-600" />)}
              </div>

              <select
                disabled={encerrado || saving}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none font-bold text-sm disabled:opacity-50 appearance-none"
                value={meuPalpite || ''}
                onChange={e => setPalpites({...palpites, [config.id]: e.target.value})}
              >
                <option value="">Selecione o craque...</option>
                {OPCOES_JOGADORES[config.id as keyof typeof OPCOES_JOGADORES].map(j => (
                  <option key={j} value={j}>{j}</option>
                ))}
              </select>

              {encerrado && !acertou && (
                <p className="text-[9px] font-black text-red-500 uppercase text-center tracking-tighter">
                  Vencedor Real: {vencedorReal}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* BOTÕES FIXOS - UNIFICADOS COM O MATA-MATA */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-gray-100 z-50">
        <div className="max-w-md mx-auto flex gap-3">
          <button 
            onClick={handleSave} 
            disabled={saving} 
            className="bg-gray-100 text-[#003366] p-5 rounded-[24px] shadow-xl hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          </button>
          <button 
            onClick={() => router.push('/palpites')} 
            className="flex-1 bg-[#003366] text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            Continuar <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </main>
  )
}