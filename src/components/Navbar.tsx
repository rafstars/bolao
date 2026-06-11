'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Trophy, Swords, ListChecks, LayoutGrid, LogOut, Award } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const NAV_ITEMS = [
  { label: 'Grupos', href: '/palpites', icon: LayoutGrid },
  { label: 'Mata-mata', href: '/mata-mata', icon: Swords },
  { label: 'Prêmios', href: '/premios', icon: Award }, // Entre Mata-mata e Ranking
  { label: 'Ranking', href: '/ranking', icon: Trophy },
  { label: 'Regras', href: '/regras', icon: ListChecks },
]

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (pathname === '/login' || pathname === '/') return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 z-50">
      <div className="max-w-md mx-auto flex justify-around p-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`flex flex-col items-center p-2 rounded-xl transition-all ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-400'}`}
            >
              <Icon size={20} strokeWidth={isActive ? 3 : 2} />
              <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">{item.label}</span>
            </Link>
          )
        })}
        
        <button 
          onClick={handleSignOut}
          className="flex flex-col items-center p-2 rounded-xl text-red-400 hover:bg-red-50 transition-all"
        >
          <LogOut size={20} />
          <span className="text-[9px] font-black mt-1 uppercase tracking-tighter">Sair</span>
        </button>
      </div>
    </nav>
  )
}