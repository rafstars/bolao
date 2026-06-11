'use client'

import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#003366] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorativo - Gradiente Circular */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-900/40 rounded-full blur-[100px]"></div>

      {/* Card Principal com Glassmorphism */}
      <div className="w-full max-w-sm bg-white/10 backdrop-blur-xl border border-white/20 rounded-[48px] p-8 shadow-2xl flex flex-col items-center text-center space-y-8 z-10">
        
        {/* Top Pill - Contraste Aumentado */}
        <div className="bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-100">
            Copa do Mundo 2026
          </span>
        </div>

        {/* Troféu e Logo */}
        <div className="relative">
          <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-[32px] flex items-center justify-center shadow-[0_20px_40px_rgba(234,179,8,0.3)] rotate-3">
            <Trophy size={48} className="text-white drop-shadow-lg" />
          </div>
        </div>

        {/* Textos Principais */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-white leading-tight uppercase italic tracking-tighter">
            Bolão<br/> 
            <span className="text-yellow-400">EloGroup</span>
          </h1>
          <p className="text-sm text-blue-200 font-medium opacity-80">
            Palpites encerram em 13/06 às 15h BRT
          </p>
        </div>

        {/* Botão de Ação - Único e Direto para o Login */}
        <Link 
          href="/login" 
          className="w-full bg-white hover:bg-blue-50 text-[#003366] py-5 rounded-3xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95 group"
        >
          Escolher palpites
          <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Dots Decorativos */}
        <div className="flex gap-2 opacity-30">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>

        {/* Créditos de Autor */}
        <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">
          Feito por Rafael Moraes
        </p>
      </div>
    </main>
  )
}