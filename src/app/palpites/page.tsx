'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Countdown } from '@/components/Countdown'
import { calculateGroupStandings } from '@/lib/simulator'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MapPin, Calendar, User, Star, Award, CheckCircle2 } from 'lucide-react'

const GRUPOS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L']

export default function PalpitesPage() {
  const [activeGroup, setActiveGroup] = useState('A')
  const [matches, setMatches] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<{ apelido: string; pontos_total: number } | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('usuarios').select('*').eq('id', user.id).single()
          setUserData(profile)
        }
        
        const { data: tData } = await supabase.from('selecoes').select('*')
        const { data: mData } = await supabase.from('jogos').select('*, time_a:time_a_id(*), time_b:time_b_id(*)').order('data_jogo')
        const { data: pData } = await supabase.from('palpites_jogos').select('*').eq('usuario_id', user?.id)

        const merged = mData?.map(m => {
          const pick = pData?.find(p => p.jogo_id === m.id)
          return { 
            ...m, 
            palpite_a: pick?.gols_a ?? null, 
            palpite_b: pick?.gols_b ?? null,
            pontos_ganhos: pick?.total_pts ?? 0 
          }
        })

        setTeams(tData || [])
        setMatches(merged || [])
      } finally { setLoading(false) }
    }
    fetchData()
  }, [])

  // Lógica dos 3 melhores terceiros
  const bestThirdsIds = useMemo(() => {
    const allThirds = GRUPOS.map(g => {
      const gTeams = teams.filter(t => t.grupo_id === g)
      const gMatches = matches.filter(m => m.grupo_id === g).map(m => ({
          ...m, gols_a: m.palpite_a, gols_b: m.palpite_b // Para simular a tabela com o palpite
      }))
      const std = calculateGroupStandings(gTeams, gMatches)
      return std[2] 
    }).filter(Boolean)

    return allThirds
      .sort((a, b) => b.pts - a.pts || b.sg - a.sg)
      .slice(0, 3)
      .map(t => t.id)
  }, [matches, teams])

  const handleScoreChange = (id: string, side: 'a' | 'b', val: string) => {
    setMatches(prev => prev.map(m => {
      if (m.id === id) {
        let n = val === '' ? null : Math.max(0, parseInt(val))
        return { ...m, [side === 'a' ? 'palpite_a' : 'palpite_b']: n }
      }
      return m
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    const toSave = matches
      .filter(m => m.palpite_a !== null && m.palpite_b !== null)
      .map(m => ({
        usuario_id: user?.id,
        jogo_id: m.id,
        gols_a: m.palpite_a,
        gols_b: m.palpite_b
      }))
    await supabase.from('palpites_jogos').upsert(toSave, { onConflict: 'usuario_id, jogo_id' })
    alert('Palpites salvos! 🏆')
    setSaving(false)
  }

  const groupStandings = useMemo(() => {
      const gMatches = matches.filter(m => m.grupo_id === activeGroup).map(m => ({
          ...m, gols_a: m.palpite_a, gols_b: m.palpite_b
      }))
      return calculateGroupStandings(teams.filter(t => t.grupo_id === activeGroup), gMatches)
  }, [matches, teams, activeGroup])

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-[#003366]">CARREGANDO...</div>

  return (
    <main className="max-w-md mx-auto p-4 space-y-6 bg-gray-50 min-h-screen pb-44">
      {/* HEADER ELO DARK */}
      <header className="flex items-center justify-between bg-[#001A33] p-6 rounded-[32px] text-white shadow-2xl border-b-4 border-[#FFDF00]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
            <User size={24} className="text-yellow-400" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-white/50 tracking-widest">Palpiteiro</p>
            <p className="font-black italic text-lg leading-none">{userData?.apelido || 'Usuário'}</p>
          </div>
        </div>
        <div className="text-right bg-white/10 px-5 py-2.5 rounded-2xl border border-white/10">
          <p className="text-[10px] uppercase font-bold text-[#FFDF00] mb-1">Pontos</p>
          <p className="text-2xl font-black leading-none">{userData?.pontos_total || 0}</p>
        </div>
      </header>

      <Countdown />

      {/* ABAS GRUPOS */}
      <nav className="sticky top-0 z-20 bg-gray-50/90 backdrop-blur-md py-4">
        <div className="flex gap-3 overflow-x-auto pb-4 px-2 scrollbar-elo">
          {GRUPOS.map(g => (
            <button key={g} onClick={() => setActiveGroup(g)} className={`flex-shrink-0 w-12 h-12 rounded-2xl font-black border-2 transition-all ${activeGroup === g ? 'bg-[#003366] text-white border-[#003366]' : 'bg-white text-[#003366] border-gray-100'}`}>{g}</button>
          ))}
        </div>
      </nav>

      {/* TABELA */}
      <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-5">
        <h2 className="font-black text-[#003366] mb-5 text-sm uppercase">📊 Tabela Grupo {activeGroup}</h2>
        <div className="space-y-4">
          {groupStandings.map((team, idx) => {
            const isTop3Third = bestThirdsIds.includes(team.id) && idx === 2;
            return (
              <div key={team.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-black 
                    ${idx < 2 ? 'bg-green-100 text-green-700' : isTop3Third ? 'bg-yellow-400 text-yellow-900 shadow-md ring-2 ring-yellow-200' : 'bg-gray-100 text-gray-400'}`}>
                    {idx + 1}º
                  </span>
                  <img src={team.bandeira_url} className="w-7 h-5 object-cover rounded shadow-xs" alt="" />
                  <span className="font-bold text-gray-700 text-sm">{team.nome}</span>
                </div>
                <div className="flex gap-4 font-mono font-black text-sm">
                  <span className="text-[#003366]">{team.pts}p</span>
                  <span className="text-gray-300 w-8 text-right">{team.sg}sg</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* LISTA DE JOGOS COM CAIXINHA DE PONTOS E RESULTADO REAL */}
      <section className="space-y-4">
        {matches.filter(m => m.grupo_id === activeGroup).map(jogo => (
          <div key={jogo.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50/50 px-5 py-2.5 border-b flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-1.5"><Calendar size={12} className="text-blue-500" /> {format(new Date(jogo.data_jogo), "dd 'de' MMM")}</div>
              <div className="flex items-center gap-1.5 truncate"><MapPin size={12} className="text-green-500" /> {jogo.cidade}</div>
            </div>

            <div className="p-5 flex items-center justify-between">
              <div className="flex flex-col items-center gap-2 w-16 text-center">
                <img src={jogo.time_a?.bandeira_url} className="w-10 h-7 object-cover rounded-lg" alt="" />
                <span className="text-[10px] font-black text-gray-400">{jogo.time_a?.codigo}</span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-3 relative">
                  <input type="number" min="0" className="w-14 h-16 text-center text-3xl font-black bg-gray-50 border-2 border-transparent focus:border-[#003366] rounded-2xl outline-none" value={jogo.palpite_a ?? ''} onChange={(e) => handleScoreChange(jogo.id, 'a', e.target.value)} />
                  
                  {/* CAIXINHA DE PONTOS (Aparece se o jogo acabou) */}
                  {jogo.encerrado && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-[#001A33] text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg z-10 animate-bounce border border-yellow-500">
                      +{jogo.pontos_ganhos} PTS
                    </div>
                  )}

                  <span className="text-gray-200 font-black italic">VS</span>
                  
                  <input type="number" min="0" className="w-14 h-16 text-center text-3xl font-black bg-gray-50 border-2 border-transparent focus:border-[#003366] rounded-2xl outline-none" value={jogo.palpite_b ?? ''} onChange={(e) => handleScoreChange(jogo.id, 'b', e.target.value)} />
                </div>
                
                {/* RESULTADO OFICIAL (Menor, abaixo do palpite) */}
                {jogo.encerrado ? (
                  <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-xs">
                    <span className="text-[10px] font-black text-[#003366] opacity-60">OFICIAL:</span>
                    <span className="text-[10px] font-black text-blue-600">{jogo.gols_a} x {jogo.gols_b}</span>
                  </div>
                ) : (
                  <div className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Aguardando Início</div>
                )}
              </div>

              <div className="flex flex-col items-center gap-2 w-16 text-center">
                <img src={jogo.time_b?.bandeira_url} className="w-10 h-7 object-cover rounded-lg" alt="" />
                <span className="text-[10px] font-black text-gray-400">{jogo.time_b?.codigo}</span>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* BOTÃO SALVAR FIXO */}
      <div className="fixed bottom-24 left-0 right-0 p-4 z-40 flex justify-center">
        <button onClick={handleSave} disabled={saving} className="w-full max-w-md bg-[#003366] text-white py-5 rounded-3xl font-black uppercase tracking-widest shadow-2xl hover:bg-[#002244] active:scale-95 transition-all">
          {saving ? 'SALVANDO...' : 'SALVAR PALPITES'}
        </button>
      </div>
    </main>
  )
}