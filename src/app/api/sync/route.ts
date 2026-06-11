import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const isSimulated = searchParams.get('simulate') === 'true'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    let matches = []

    if (isSimulated) {
      // MOCK: Simula o resultado da abertura (México 2 x 1 África do Sul)
      matches = [{
        status: 'FINISHED',
        homeTeam: { tla: 'MEX' },
        awayTeam: { tla: 'RSA' },
        score: { fullTime: { home: 2, away: 1 } }
      }]
    } else {
      // REAL: Busca na API Football-Data
      const response = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
        headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! },
        next: { revalidate: 0 } 
      })
      const data = await response.json()
      matches = data.matches?.filter((m: any) => m.status === 'FINISHED') || []
    }

    let updatedCount = 0

    for (const match of matches) {
      // 1. Busca os IDs das seleções no seu banco usando o código (BRA, MEX, etc)
      const { data: homeTeam } = await supabase.from('selecoes').select('id').eq('codigo', match.homeTeam.tla).single()
      const { data: awayTeam } = await supabase.from('selecoes').select('id').eq('codigo', match.awayTeam.tla).single()

      if (homeTeam && awayTeam) {
        // 2. Atualiza o jogo correspondente
        const { error } = await supabase
          .from('jogos')
          .update({
            gols_a: match.score.fullTime.home,
            gols_b: match.score.fullTime.away,
            encerrado: true
          })
          .match({ time_a_id: homeTeam.id, time_b_id: awayTeam.id, encerrado: false })

        if (!error) updatedCount++
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Sincronização concluída: ${updatedCount} jogos atualizados.`,
      mode: isSimulated ? 'SIMULADO' : 'REAL'
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}