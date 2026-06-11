'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Trophy, Medal, User, Crown, TrendingUp } from 'lucide-react'

export default function RankingPage() {
  const [ranking, setRanking] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createClient()

  useEffect(() => {
    async function loadRanking() {
      setLoading(true);
      try {
        // 1. Pegar usuário logado para destaque
        const { data: { user } } = await supabase.auth.getUser();
        
        // 2. Buscar todos os usuários (mesmo com 0 pontos)
        const { data: users, error } = await supabase
          .from('usuarios')
          .select('*')
          .order('pontos_total', { ascending: false })
          .order('apelido', { ascending: true }); // Desempate por nome

        if (error) throw error;

        if (users) {
          setRanking(users);
          if (user) {
            const found = users.find(u => u.id === user.id);
            setCurrentUser(found);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar ranking:", err);
      } finally {
        setLoading(false);
      }
    }
    loadRanking()

    // Habilitar Realtime: se o admin atualizar os pontos, o ranking muda na hora!
    const channel = supabase
      .channel('ranking_changes')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'usuarios' }, () => {
        loadRanking()
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#003366] text-white">
      <div className="animate-bounce mb-4"><Trophy size={48} className="text-yellow-400" /></div>
      <p className="font-black uppercase tracking-widest text-xs">Calculando Liderança...</p>
    </div>
  )

  const podium = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  return (
    <main className="max-w-md mx-auto bg-gray-50 min-h-screen pb-32">
      {/* HEADER E PODIUM */}
      <header className="bg-[#001533] text-white p-6 rounded-b-[48px] shadow-2xl space-y-8 border-b-4 border-brazil-yellow relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brazil-green/10 rounded-full blur-3xl"></div>
        
        <div className="text-center space-y-1 relative z-10">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter">Tabela de Líderes</h1>
          <p className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.3em]">Bolão da Copa 2026 • EloGroup</p>
        </div>

        {/* VISUAL DO PODIUM */}
        <div className="flex items-end justify-center gap-2 pb-4 relative z-10">
          {/* 2º Lugar */}
          {podium[1] && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gray-400/20 border-2 border-gray-300 flex items-center justify-center">
                <User size={24} className="text-gray-300" />
              </div>
              <div className="bg-gray-400 h-16 w-12 rounded-t-xl flex flex-col items-center justify-center shadow-lg">
                <span className="font-black text-lg">2º</span>
              </div>
              <p className="text-[10px] font-bold truncate w-16 text-center">{podium[1].apelido}</p>
            </div>
          )}

          {/* 1º Lugar */}
          {podium[0] && (
            <div className="flex flex-col items-center gap-2 -mt-4">
              <Crown className="text-yellow-400 animate-pulse" size={24} fill="currentColor" />
              <div className="w-16 h-16 rounded-3xl bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center shadow-[0_0_20px_rgba(255,223,0,0.3)]">
                <User size={32} className="text-yellow-400" />
              </div>
              <div className="bg-yellow-500 h-24 w-16 rounded-t-2xl flex flex-col items-center justify-center shadow-xl">
                <span className="font-black text-2xl">1º</span>
              </div>
              <p className="text-xs font-black truncate w-20 text-center text-yellow-400">{podium[0].apelido}</p>
            </div>
          )}

          {/* 3º Lugar */}
          {podium[2] && (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-orange-400/20 border-2 border-orange-500 flex items-center justify-center">
                <User size={24} className="text-orange-500" />
              </div>
              <div className="bg-orange-600 h-12 w-12 rounded-t-xl flex flex-col items-center justify-center shadow-lg">
                <span className="font-black text-lg">3º</span>
              </div>
              <p className="text-[10px] font-bold truncate w-16 text-center">{podium[2].apelido}</p>
            </div>
          )}
        </div>
      </header>

      {/* LISTA DE PARTICIPANTES */}
      <div className="p-4 -mt-6">
        <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
          {ranking.map((user, index) => {
            const isMe = currentUser?.id === user.id
            return (
              <div 
                key={user.id} 
                className={`flex items-center justify-between p-5 border-b last:border-0 transition-all
                  ${isMe ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'bg-white'}`}
              >
                <div className="flex items-center gap-4">
                  <span className={`w-6 text-xs font-black font-mono ${index < 3 ? 'text-blue-600' : 'text-gray-300'}`}>
                    {index + 1}º
                  </span>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black 
                    ${isMe ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {user.apelido?.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-bold text-sm ${isMe ? 'text-blue-900' : 'text-gray-700'}`}>
                      {user.apelido} {isMe && <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full ml-2">VOCÊ</span>}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-black text-[#003366] leading-none">{user.pontos_total || 0}</p>
                  <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">PONTOS</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FOOTER STATS DO USUÁRIO LOGADO */}
      {currentUser && (
        <div className="fixed bottom-20 left-0 right-0 p-4 z-40">
          <div className="max-w-md mx-auto bg-[#003366] text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between border-t-2 border-white/10">
            <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-brazil-green" />
              <div>
                <p className="text-[9px] font-black uppercase text-blue-300">Sua Posição Atual</p>
                <p className="font-black text-lg leading-none">
                  {ranking.findIndex(u => u.id === currentUser.id) + 1}º Lugar
                </p>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-white/10"></div>
            <div className="text-right">
              <p className="text-[9px] font-black uppercase text-blue-300">Total Acumulado</p>
              <p className="font-black text-lg leading-none text-brazil-yellow">{currentUser.pontos_total} pts</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}