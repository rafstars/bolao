'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function AdminPage() {
  const [jogos, setJogos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchJogos()
  }, [])

  async function fetchJogos() {
    const { data } = await supabase
      .from('jogos')
      .select('*, time_a:time_a_id(nome, codigo), time_b:time_b_id(nome, codigo)')
      .eq('encerrado', false)
      .order('data_jogo', { ascending: true })
    setJogos(data || [])
    setLoading(false)
  }

  const handleSetScore = (id: string, team: 'a' | 'b', val: string) => {
    setJogos(prev => prev.map(j => j.id === id ? { ...j, [`gols_${team}`]: parseInt(val) } : j))
  }

  const encerrarJogo = async (jogo: any) => {
    if (jogo.gols_a === undefined || jogo.gols_b === undefined) return alert('Preencha o placar!')
    
    setSavingId(jogo.id)
    
    // Chama a função SQL que criamos no passo anterior
    const { error } = await supabase.rpc('processar_resultado_jogo', {
      p_jogo_id: jogo.id,
      p_gols_a: jogo.gols_a,
      p_gols_b: jogo.gols_b
    })

    if (error) {
      alert('Erro ao processar: ' + error.message)
    } else {
      alert('Jogo encerrado e pontos distribuídos! 🎉')
      fetchJogos() // Recarrega a lista
    }
    setSavingId(null)
  }

  if (loading) return <div className="p-10 text-center">Carregando jogos abertos...</div>

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <header className="border-b pb-4">
        <h1 className="text-2xl font-bold text-red-600 uppercase">Painel do Comissário 🛠️</h1>
        <p className="text-gray-500 text-sm">Insira os resultados REAIS para calcular o ranking.</p>
      </header>

      <div className="grid gap-4">
        {jogos.map(jogo => (
          <div key={jogo.id} className="bg-white p-4 rounded-xl border shadow-sm flex items-center justify-between">
            <div className="flex-1 text-right font-bold text-gray-700">{jogo.time_a.nome}</div>
            
            <div className="flex items-center gap-2 mx-4">
              <input 
                type="number" 
                className="w-12 h-10 border rounded text-center font-bold"
                onChange={(e) => handleSetScore(jogo.id, 'a', e.target.value)}
              />
              <span>x</span>
              <input 
                type="number" 
                className="w-12 h-10 border rounded text-center font-bold"
                onChange={(e) => handleSetScore(jogo.id, 'b', e.target.value)}
              />
            </div>

            <div className="flex-1 text-left font-bold text-gray-700">{jogo.time_b.nome}</div>

            <button 
              onClick={() => encerrarJogo(jogo)}
              disabled={savingId === jogo.id}
              className="ml-4 bg-black text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-gray-800 disabled:opacity-50"
            >
              {savingId === jogo.id ? 'Processando...' : 'Encerrar'}
            </button>
          </div>
        ))}

        {jogos.length === 0 && (
          <div className="text-center py-20 text-gray-400">Todos os jogos foram processados ou não há jogos hoje.</div>
        )}
      </div>
    </main>
  )
}