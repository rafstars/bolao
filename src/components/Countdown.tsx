'use client'
import { useState, useEffect } from 'react'
import { intervalToDuration } from 'date-fns'

const DEADLINE = new Date('2026-06-13T15:00:00') // Horário de Brasília aproximado

export function Countdown() {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const duration = intervalToDuration({ start: now, end: DEADLINE })

  if (now >= DEADLINE) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-lg text-center font-bold">
        Palpites Encerrados! 🔒
      </div>
    )
  }

  return (
    <div className="flex gap-4 justify-center text-center p-6 bg-blue-50 rounded-xl border border-blue-200">
      <div>
        <span className="block text-3xl font-bold text-blue-900">{duration.days || 0}d</span>
        <span className="text-xs uppercase text-blue-600 font-medium">Dias</span>
      </div>
      <div>
        <span className="block text-3xl font-bold text-blue-900">{duration.hours || 0}h</span>
        <span className="text-xs uppercase text-blue-600 font-medium">Horas</span>
      </div>
      <div>
        <span className="block text-3xl font-bold text-blue-900">{duration.minutes || 0}m</span>
        <span className="text-xs uppercase text-blue-600 font-medium">Min</span>
      </div>
      <div>
        <span className="block text-3xl font-bold text-blue-900 animate-pulse">{duration.seconds || 0}s</span>
        <span className="text-xs uppercase text-blue-600 font-medium">Seg</span>
      </div>
    </div>
  )
}