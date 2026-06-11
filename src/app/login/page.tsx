'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/lib/supabase'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
    
    // Verificar se já está logado
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) router.push('/palpites')
    }
    checkUser()

    // Escutar mudanças de auth (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        router.push('/palpites')
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6">
        <header className="text-center space-y-2">
          <div className="inline-block p-4 bg-blue-50 rounded-2xl mb-2">
            <span className="text-3xl">🏆</span>
          </div>
          <h1 className="text-2xl font-black text-blue-900 uppercase italic">
            Entrar no Bolão
          </h1>
          <p className="text-sm text-gray-500">
            Use seu e-mail para palpitar e acompanhar o ranking da EloGroup.
          </p>
        </header>

        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb', // blue-600
                  brandAccent: '#1d4ed8', // blue-700
                },
                radii: {
                  buttonBorderRadius: '12px',
                  inputBorderRadius: '12px',
                }
              }
            }
          }}
          providers={[]} // Adicione 'google' aqui futuramente se configurar
          localization={{
            variables: {
              sign_in: {
                email_label: 'Seu e-mail corporativo ou pessoal',
                password_label: 'Sua senha',
                button_label: 'Entrar agora',
                loading_button_label: 'Entrando...',
                link_text: 'Já tem uma conta? Entre',
              },
              sign_up: {
                email_label: 'E-mail',
                password_label: 'Crie uma senha',
                button_label: 'Criar conta',
                loading_button_label: 'Criando conta...',
                link_text: 'Não tem conta? Cadastre-se',
              }
            }
          }}
          redirectTo={`${origin}/reset-password`}
        />

        <footer className="text-center text-xs text-gray-400 pt-4">
          Bolão da Copa 2026 • EloGroup
        </footer>
      </div>
    </main>
  )
}