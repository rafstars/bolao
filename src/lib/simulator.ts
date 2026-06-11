// src/lib/simulator.ts
export interface TeamStats {
  id: string;
  nome: string;
  codigo: string;
  bandeira_url: string;
  pts: number;
  gp: number;
  gc: number;
  sg: number;
}

export function calculateGroupStandings(teams: any[], matches: any[]) {
  const standings: Record<string, TeamStats> = {};

  // Inicializa todos os times do grupo
  teams.forEach(t => {
    standings[t.id] = { ...t, pts: 0, gp: 0, gc: 0, sg: 0 };
  });

  // Processa os jogos
  matches.forEach(m => {
    if (m.gols_a === null || m.gols_b === null) return;

    const tA = standings[m.time_a_id];
    const tB = standings[m.time_b_id];

    if (!tA || !tB) return;

    tA.gp += Number(m.gols_a);
    tA.gc += Number(m.gols_b);
    tB.gp += Number(m.gols_b);
    tB.gc += Number(m.gols_a);

    tA.sg = tA.gp - tA.gc;
    tB.sg = tB.gp - tB.gc;

    if (m.gols_a > m.gols_b) tA.pts += 3;
    else if (m.gols_a < m.gols_b) tB.pts += 3;
    else { tA.pts += 1; tB.pts += 1; }
  });

  // Ordena por: Pts -> Saldo -> Gols Pró
  return Object.values(standings).sort((a, b) => 
    b.pts - a.pts || b.sg - a.sg || b.gp - a.gp
  );
}