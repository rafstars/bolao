'use client'

import { ListChecks, Target, Swords, Award, Info, Clock, Globe, CheckCircle2, ChevronRight } from 'lucide-react'

export default function RegrasPage() {
  return (
    <main className="max-w-md mx-auto bg-gray-50 min-h-screen pb-44">
      {/* HEADER */}
      <header className="bg-[#001533] text-white p-8 rounded-b-[40px] shadow-lg text-center space-y-2">
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">Manual do Bolão</h1>
        <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Como funciona?</p>
      </header>

      <div className="p-4 space-y-6">
        
        {/* 1. O QUE VOCÊ PRECISA PREENCHER (CHECKLIST) */}
        <section className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-3 text-[#003366] font-black uppercase text-xs tracking-widest">
             <CheckCircle2 size={20} className="text-emerald-500" /> O que preencher
          </div>
          
          <div className="space-y-3">
            {[
              { t: "Palpites de placar (72 jogos)", d: "Aba 'Grupos'", id: "1" },
              { t: "Mata-mata (Shortlist)", d: "Aba 'Mata-mata' (Até o Pódio)", id: "2" },
              { t: "Prêmios Finais", d: "Aba 'Prêmios' (Craques da Copa)", id: "3" },
            ].map(item => (
              <div key={item.id} className="flex gap-3 items-start border-l-2 border-emerald-100 pl-4">
                <span className="text-xs font-black text-[#003366]">{item.id}.</span>
                <div>
                  <p className="text-[11px] font-black text-gray-700 leading-none uppercase">{item.t}</p>
                  <p className="text-[10px] font-bold text-emerald-600">{item.d}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ALERTA DE PRAZO */}
          <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-amber-700 font-black uppercase text-[9px] mb-1">
              <Clock size={14} /> Atenção ao Prazo!
            </div>
            <p className="text-[10px] text-amber-800 leading-relaxed font-medium">
              Faça tudo antes do tempo limite <strong>(13/06/2026 às 15h)</strong>! 
              Os prêmios e o chaveamento do mata-mata travam nesse dia/horário.
            </p>
          </div>
        </section>

        {/* 2. PONTUAÇÃO POR JOGO (DETALHADO) */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#003366] font-black uppercase text-xs tracking-widest">
            <Target size={20} className="text-blue-500" /> Pontuação por Jogo
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
            <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase italic">
              * Itens independentes e acumuláveis
            </p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Gols do Mandante Correto', pts: 1 },
                { label: 'Gols do Visitante Correto', pts: 1 },
                { label: 'Diferença de Gols Exata', pts: 2 },
                { label: 'Vencedor / Empate Correto', pts: 2 },
              ].map(r => (
                <div key={r.label} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <span className="text-[10px] font-bold text-gray-600">{r.label}</span>
                  <span className="text-[10px] font-black text-[#003366]">+{r.pts}</span>
                </div>
              ))}
              <div className="mt-2 p-4 bg-blue-600 rounded-2xl flex justify-between items-center text-white shadow-lg border-b-4 border-blue-800">
                <span className="text-xs font-black uppercase italic tracking-wider text-blue-100">Placar Exato</span>
                <span className="text-sm font-black">6 PTS</span>
              </div>
            </div>
          </div>
        </section>

        {/* 3. CLASSIFICAÇÃO DE GRUPO */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#003366] font-black uppercase text-xs tracking-widest">
            <ListChecks size={20} className="text-emerald-500" /> Bônus de Classificação
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-2">
            {[
              { label: 'Posição Exata (1º ou 2º)', pts: 2 },
              { label: 'Acertar Seleção que Passa', pts: 2 },
              { label: 'Acertar 3º Classificado', pts: 1 },
              { label: 'Ordem Exata dos 4 Selecionados', pts: 2 },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center p-3 border-b border-gray-50 last:border-0">
                <span className="text-[10px] font-bold text-gray-600">{r.label}</span>
                <span className="text-[10px] font-black text-emerald-600">+{r.pts}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 4. MATA-MATA (PESOS PESADOS) */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#003366] font-black uppercase text-xs tracking-widest">
            <Swords size={20} className="text-red-500" /> Shortlist Mata-Mata
          </div>
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 divide-y divide-gray-50">
            {[
              { label: 'Acertou Top 16 (Oitavas)', pts: 8 },
              { label: 'Acertou Top 8 (Quartas)', pts: 14 },
              { label: 'Acertou Top 4 (Semi)', pts: 20 },
              { label: 'Acertou Finalistas (Top 2)', pts: 28 },
              { label: 'BÔNUS: 3º Lugar', pts: 18 },
              { label: 'BÔNUS: Vice-Campeão', pts: 24 },
              { label: 'BÔNUS: Grande Campeão', pts: 45 },
            ].map(f => (
              <div key={f.label} className="flex justify-between items-center p-4">
                <span className="text-[10px] font-bold text-gray-600">{f.label}</span>
                <span className="text-[11px] font-black text-red-600">+{f.pts}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. PRÊMIOS INDIVIDUAIS */}
        <section className="space-y-4">
          <div className="flex items-center gap-3 text-[#003366] font-black uppercase text-xs tracking-widest">
            <Award size={20} className="text-yellow-500" /> Craques da Copa
          </div>
          <div className="grid grid-cols-1 gap-2">
            {['Bola de Ouro', 'Chuteira de Ouro', 'Luva de Ouro'].map(p => (
              <div key={p} className="bg-white p-4 rounded-2xl border-l-4 border-l-yellow-400 shadow-sm flex justify-between items-center">
                <span className="text-[10px] font-black text-[#003366] uppercase">{p}</span>
                <span className="text-xs font-black text-yellow-600">30 PTS</span>
              </div>
            ))}
          </div>
        </section>

        {/* 6. CURIOSIDADES DA COPA (PRINCIPAIS MUDANÇAS) */}
        <section className="bg-[#003366] p-8 rounded-[40px] shadow-2xl space-y-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe size={100} className="text-white" />
          </div>
          
          <div className="flex items-center gap-3 text-white font-black uppercase text-xs tracking-widest relative z-10">
            <Globe size={20} className="text-blue-400" /> Copa 2026: Mudanças
          </div>
          
          <ul className="space-y-4 relative z-10">
            {[
              "48 seleções participam (12 grupos de 4 times)",
              "3 países-sede: EUA, Canadá e México",
              "104 jogos no total (Copa mais longa da história)",
              "Mata-mata expandido: inicia na fase de 16 avos",
              "Os 2 primeiros + 8 melhores 3ºs avançam",
              "Final no MetLife Stadium (NY) em 19/07/2026"
            ].map((text, i) => (
              <li key={i} className="flex gap-3 text-[10px] text-blue-100 font-bold leading-tight">
                <ChevronRight size={14} className="text-yellow-400 shrink-0" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        <footer className="text-center p-8">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.4em]">
            Críticas, sugestões e dúvidas: rafael.moraes@elogroup.com.br
          </p>
        </footer>
      </div>
    </main>
  )
}