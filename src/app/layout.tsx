import './globals.css'
import { Inter } from 'next/font/google'
import { Navbar } from '@/components/Navbar' // 1. Importamos o componente que você criou

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Bolão Copa 2026 - EloGroup',
  description: 'Desafio AI World Cup',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-br">
      {/* 2. O inter.className aplica a fonte em todo o site */}
      <body className={`${inter.className} bg-gray-50`}>
        {/* 3. O children é o conteúdo de cada página (Home, Palpites, etc.) */}
        {children}
        
        {/* 4. Colocamos a Navbar aqui para ela ficar fixa no rodapé de todas as páginas */}
        <Navbar />
      </body>
    </html>
  )
}