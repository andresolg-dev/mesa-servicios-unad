'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Info } from 'lucide-react'

const PREDEFINED_USERS = [
  { email: 'guzmanpalaciosmichelcamila@gmail.com', role: 'Cliente' },
  { email: 'pcpaulacorredor1@gmail.com', role: 'Técnico N1' },
  { email: 'jufefiguti123@gmail.com', role: 'Técnico N2' },
  { email: 'andypadilla1810@gmail.com', role: 'Técnico N3' },
  { email: 'andresolgin.rodriguez@gmail.com', role: 'Administrador' },
]

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

export default function RegisterPage() {
  const { signUp } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    department: '',
    phone: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLoading(true)
    try {
      await signUp(formData.email, formData.password, formData.displayName, formData.department, formData.phone)
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((f) => ({ ...f, [field]: e.target.value }))

  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md space-y-7">

        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow shadow-primary/30">
            <TcLogomark />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Crear cuenta</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Servicios TecnoColombia S.A.S</p>
          </div>
        </div>

        {/* Role notice */}
        <Alert className="border-primary/20 bg-primary/5">
          <Info className="h-4 w-4 text-primary" />
          <AlertDescription className="text-xs">
            <span className="font-semibold text-foreground block mb-1">Roles predefinidos:</span>
            <ul className="space-y-0.5 text-muted-foreground">
              {PREDEFINED_USERS.map((u) => (
                <li key={u.email} className="flex items-center gap-2">
                  <span className="text-primary font-mono text-[10px] truncate max-w-[200px]">{u.email}</span>
                  <span className="shrink-0">→ {u.role}</span>
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive" className="py-3">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="displayName">Nombre completo</Label>
            <Input id="displayName" placeholder="Juan Pérez" value={formData.displayName} onChange={set('displayName')} required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" placeholder="usuario@empresa.com" value={formData.email} onChange={set('email')} autoComplete="email" required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="department">Departamento</Label>
              <Input id="department" placeholder="Ej: Ventas" value={formData.department} onChange={set('department')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Teléfono</Label>
              <Input id="phone" placeholder="3001234567" value={formData.phone} onChange={set('phone')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input id="password" type="password" placeholder="••••••••" value={formData.password} onChange={set('password')} autoComplete="new-password" required />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={set('confirmPassword')} autoComplete="new-password" required />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear cuenta'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-primary font-medium hover:underline underline-offset-4">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
