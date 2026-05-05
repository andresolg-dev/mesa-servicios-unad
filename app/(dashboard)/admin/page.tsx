'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Users, Settings, Shield, Loader2, Pencil, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/types'
import type { UserRole } from '@/lib/types'

interface UserData {
  _id: string
  email: string
  displayName: string
  role: UserRole
  department?: string
  isActive: boolean
  createdAt: string
}

// Inline editable cell for department
function DepartmentCell({
  value,
  disabled,
  onSave,
}: {
  value: string
  disabled: boolean
  onSave: (v: string) => Promise<void>
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  const open = () => {
    setDraft(value)
    setEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const cancel = () => {
    setDraft(value)
    setEditing(false)
  }

  const save = async () => {
    setEditing(false)
    if (draft.trim() !== value) {
      await onSave(draft.trim())
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') cancel()
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKey}
          className="h-7 w-32 text-sm px-2"
          placeholder="Ej: Externo"
        />
        <button onClick={save} className="text-green-600 hover:text-green-700 p-0.5" title="Guardar">
          <Check className="h-3.5 w-3.5" />
        </button>
        <button onClick={cancel} className="text-muted-foreground hover:text-destructive p-0.5" title="Cancelar">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={open}
      disabled={disabled}
      className={cn(
        'group flex items-center gap-1.5 text-sm text-left',
        disabled ? 'cursor-not-allowed opacity-50' : 'hover:text-primary'
      )}
    >
      <span>{value || <span className="text-muted-foreground italic">Sin depto.</span>}</span>
      {!disabled && (
        <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
      )}
    </button>
  )
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user?.role !== 'admin') return
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/users')
        const data = await res.json()
        if (data.users) setUsers(data.users)
      } catch (err) {
        console.error('Error fetching users:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [user])

  const patchUser = async (userId: string, body: Record<string, unknown>) => {
    setUpdating(userId)
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.ok) {
        setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...body } as UserData : u))
      }
    } catch (err) {
      console.error('Error updating user:', err)
    } finally {
      setUpdating(null)
    }
  }

  const handleRoleChange = (userId: string, newRole: UserRole) =>
    patchUser(userId, { role: newRole })

  const handleDepartmentChange = (userId: string, department: string) =>
    patchUser(userId, { department })

  const handleToggleActive = (userId: string, isActive: boolean) =>
    patchUser(userId, { isActive })

  if (authLoading || user?.role !== 'admin') return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const userStats = {
    total: users.length,
    clients: users.filter(u => u.role === 'cliente').length,
    technicians: users.filter(u => u.role?.startsWith('tecnico')).length,
    admins: users.filter(u => u.role === 'admin').length,
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Administración</h1>
        <p className="text-muted-foreground">Gestión de usuarios y configuración del sistema</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.clients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Técnicos</CardTitle>
            <Settings className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.technicians}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>
            Haz clic en el departamento para editarlo. El ícono de lápiz aparece al pasar el cursor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.displayName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell>
                      <DepartmentCell
                        value={u.department || ''}
                        disabled={updating === u._id || u._id === user?.id}
                        onSave={(dept) => handleDepartmentChange(u._id, dept)}
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={u.role}
                        onValueChange={(value) => handleRoleChange(u._id, value as UserRole)}
                        disabled={updating === u._id || u._id === user?.id}
                      >
                        <SelectTrigger className="w-[170px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'default' : 'secondary'}>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(u._id, !u.isActive)}
                        disabled={updating === u._id || u._id === user?.id}
                      >
                        {updating === u._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : u.isActive ? (
                          'Desactivar'
                        ) : (
                          'Activar'
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* SLAs */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de SLAs</CardTitle>
          <CardDescription>Acuerdos de nivel de servicio definidos para la mesa de servicios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Tiempo de Respuesta</TableHead>
                  <TableHead>Tiempo de Resolución</TableHead>
                  <TableHead>Descripción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge variant="secondary">Baja</Badge></TableCell>
                  <TableCell>8 horas</TableCell>
                  <TableCell>48 horas</TableCell>
                  <TableCell>Incidentes menores sin impacto crítico</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-yellow-500">Media</Badge></TableCell>
                  <TableCell>4 horas</TableCell>
                  <TableCell>24 horas</TableCell>
                  <TableCell>Incidentes con impacto moderado</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-orange-500">Alta</Badge></TableCell>
                  <TableCell>1 hora</TableCell>
                  <TableCell>8 horas</TableCell>
                  <TableCell>Incidentes con alto impacto en operaciones</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge variant="destructive">Crítica</Badge></TableCell>
                  <TableCell>15 minutos</TableCell>
                  <TableCell>2 horas</TableCell>
                  <TableCell>Incidentes críticos que afectan el negocio</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Assignment rules */}
      <Card>
        <CardHeader>
          <CardTitle>Reglas de Asignación por Categoría</CardTitle>
          <CardDescription>Los tickets se asignan automáticamente al nivel de soporte apropiado según prioridad y categoría</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Nivel Asignado</TableHead>
                  <TableHead>Justificación</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge variant="destructive">Crítica</Badge></TableCell>
                  <TableCell>Cualquiera</TableCell>
                  <TableCell><Badge className="bg-purple-600 text-white">Nivel 3</Badge></TableCell>
                  <TableCell>Impacto crítico — requiere el nivel técnico más alto</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-orange-500">Alta</Badge></TableCell>
                  <TableCell>Aplicación / Red & Conectividad</TableCell>
                  <TableCell><Badge className="bg-blue-600 text-white">Nivel 2</Badge></TableCell>
                  <TableCell>Alta complejidad técnica en estas categorías</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-yellow-500">Alta</Badge></TableCell>
                  <TableCell>Otras categorías</TableCell>
                  <TableCell><Badge className="bg-green-600 text-white">Nivel 1</Badge></TableCell>
                  <TableCell>Soporte de primer contacto</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge variant="secondary">Media / Baja</Badge></TableCell>
                  <TableCell>Cualquiera</TableCell>
                  <TableCell><Badge className="bg-green-600 text-white">Nivel 1</Badge></TableCell>
                  <TableCell>Atención estándar de primer nivel</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
