'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) alert(error.message)
    else {
      alert('Senha atualizada com sucesso!')
      router.push('/login')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <form onSubmit={handleUpdate} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm space-y-4">
        <h1 className="text-xl font-black text-blue-900 uppercase">Nova Senha</h1>
        <input 
          type="password" 
          placeholder="Digite sua nova senha"
          className="w-full p-4 bg-gray-50 border rounded-2xl outline-none"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button disabled={loading} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">
          {loading ? 'Atualizando...' : 'Redefinir Senha'}
        </button>
      </form>
    </main>
  )
}