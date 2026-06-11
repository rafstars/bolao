import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use a Service Role para ter permissão de escrita
  )

  try {
    const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
      next: { revalidate: 300 } // Cache de 5 minutos
    })

    const data = await response.json()
    const matches = data.matches

    // Filtramos apenas jogos finalizados (FINISHED)
    const finishedMatches = matches.filter((m: any) => m.status === 'FINISHED')

    for (const match of finishedMatches) {
      // 1. Encontrar o jogo no seu banco usando o código das seleções
      // Supomos que o código FIFA na API bata com o seu (ex: BRA, MEX)
      const { data: game } = await supabase
        .from('jogos')
        .select('id')
        .eq('time_a_id', (await supabase.from('selecoes').select('id').eq('codigo', match.homeTeam.tla).single()).data?.id)
        .eq('time_b_id', (await supabase.from('selecoes').select('id').eq('codigo', match.awayTeam.tla).single()).data?.id)
        .single()

      if (game) {
        // 2. Atualizar o placar e encerrar o jogo
        await supabase
          .from('jogos')
          .update({
            gols_a: match.score.fullTime.home,
            gols_b: match.score.fullTime.away,
            encerrado: true
          })
          .eq('id', game.id)
          .eq('encerrado', false) // Só atualiza se ainda não estiver encerrado
      }
    }

    return NextResponse.json({ message: `Sincronizados ${finishedMatches.length} jogos.` })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}