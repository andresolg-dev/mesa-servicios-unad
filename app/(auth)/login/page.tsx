'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, ShieldCheck, Zap, BarChart3 } from 'lucide-react'

function TcLogomark() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" fill="none" aria-hidden="true">
      <line x1="6" y1="11" x2="26" y2="11" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="16" y1="11" x2="16" y2="25" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="6" cy="11" r="2.5" fill="#FFB800" />
      <circle cx="26" cy="11" r="2.5" fill="white" fillOpacity="0.85" />
      <circle cx="16" cy="25" r="2.5" fill="white" fillOpacity="0.6" />
    </svg>
  )
}

const features = [
  { icon: ShieldCheck, text: 'Gestión de incidentes bajo estándares ITIL 4' },
  { icon: Zap, text: 'Escalamiento automático N1 → N2 → N3' },
  { icon: BarChart3, text: 'KPIs y cumplimiento de SLA en tiempo real' },
]

export default function LoginPage() {
  const { signIn } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full">

      {/* ── Brand panel (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-10 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, oklch(0.38 0.24 264) 0%, oklch(0.22 0.18 264) 60%, oklch(0.14 0.06 264) 100%)' }}>

        {/* Decorative network SVG */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" aria-hidden="true">
          <circle cx="15%" cy="25%" r="120" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="80%" cy="70%" r="180" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="60%" cy="15%" r="60" stroke="white" strokeWidth="1" fill="none" />
          <line x1="15%" y1="25%" x2="60%" y2="15%" stroke="white" strokeWidth="1" />
          <line x1="60%" y1="15%" x2="80%" y2="70%" stroke="white" strokeWidth="1" />
          <line x1="15%" y1="25%" x2="80%" y2="70%" stroke="white" strokeWidth="0.5" />
          <circle cx="15%" cy="25%" r="4" fill="white" fillOpacity="0.5" />
          <circle cx="60%" cy="15%" r="4" fill="#FFB800" fillOpacity="0.8" />
          <circle cx="80%" cy="70%" r="4" fill="white" fillOpacity="0.4" />
        </svg>

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
            <TcLogomark />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight tracking-tight">TecnoColombia</p>
            <p className="text-white/60 text-xs">S.A.S</p>
          </div>
        </div>

        {/* Center: Tagline + features */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-white text-3xl font-bold leading-snug tracking-tight">
              Soporte que impulsa<br />tu tecnología
            </h1>
            <p className="text-white/60 text-sm mt-3 leading-relaxed max-w-xs">
              Plataforma unificada de Mesa de Servicios TI para Servicios TecnoColombia S.A.S.
            </p>
          </div>
          <ul className="space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/10 border border-white/15">
                  <Icon className="h-3.5 w-3.5 text-white/80" />
                </div>
                <span className="text-white/75 text-sm leading-snug pt-0.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom: Badge */}
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/8 px-3 py-1 text-[11px] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            Gestión de TI · UNAD 202016904
          </span>
        </div>
      </div>

      {/* ── Login form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-10">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow shadow-primary/30">
            <TcLogomark />
          </div>
          <div>
            <p className="font-bold text-base leading-tight">TecnoColombia</p>
            <p className="text-muted-foreground text-xs">S.A.S · Mesa de Servicios</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-7">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Iniciar sesión</h2>
            <p className="text-muted-foreground text-sm">Ingresa con tu correo institucional</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="py-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                'Ingresar al sistema'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            ¿Primera vez aquí?{' '}
            <Link href="/register" className="text-primary font-medium hover:underline underline-offset-4">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
