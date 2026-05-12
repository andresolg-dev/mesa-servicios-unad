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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Users, Settings, Shield, Loader2, Pencil, Check, X, UserPlus } from 'lucide-react'
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
    if (draft.trim() !== value) await onSave(draft.trim())
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

const EMPTY_FORM = { displayName: '', email: '', password: '', role: 'cliente' as UserRole, department: '', phone: '' }

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [userSearch, setUserSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const isAdmin = user?.role === 'admin'
  const isAuditor = user?.role === 'auditor'
  const canAccess = isAdmin || isAuditor

  useEffect(() => {
    if (!authLoading && user && !canAccess) {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router, canAccess])

  useEffect(() => {
    if (!canAccess) return
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
  }, [canAccess])

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

  const handleCreate = async () => {
    setCreateError('')
    if (!form.displayName || !form.email || !form.password) {
      setCreateError('Nombre, email y contraseña son requeridos')
      return
    }
    setCreating(true)
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) {
        setCreateError(data.error || 'Error al crear usuario')
        return
      }
      setUsers(prev => [data.user, ...prev])
      setCreateOpen(false)
      setForm(EMPTY_FORM)
    } catch {
      setCreateError('Error de conexión')
    } finally {
      setCreating(false)
    }
  }

  if (authLoading || !canAccess) return null

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
    admins: users.filter(u => u.role === 'admin' || u.role === 'auditor').length,
  }

  const filteredUsers = users.filter(u => {
    if (!userSearch) return true
    const q = userSearch.toLowerCase()
    return u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Usuarios & Roles</h1>
        <p className="text-muted-foreground">
          {isAuditor ? 'Vista de solo lectura' : 'Gestión de usuarios del sistema'}
        </p>
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
            <CardTitle className="text-sm font-medium">Admin / Auditores</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.admins}</div>
          </CardContent>
        </Card>
      </div>

      {/* Users table */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              {isAuditor
                ? 'Listado de todos los usuarios del sistema (solo lectura)'
                : 'Haz clic en el departamento para editarlo. El ícono de lápiz aparece al pasar el cursor.'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por nombre, email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-56 h-8 text-sm"
            />
            {isAdmin && (
              <Button size="sm" onClick={() => { setForm(EMPTY_FORM); setCreateError(''); setCreateOpen(true) }}>
                <UserPlus className="h-4 w-4 mr-1.5" />
                Nuevo usuario
              </Button>
            )}
          </div>
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
                  {isAdmin && <TableHead>Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u._id}>
                    <TableCell className="font-medium">{u.displayName}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{u.email}</TableCell>
                    <TableCell>
                      {isAuditor ? (
                        <span className="text-sm">{u.department || <span className="text-muted-foreground italic">Sin depto.</span>}</span>
                      ) : (
                        <DepartmentCell
                          value={u.department || ''}
                          disabled={updating === u._id || u._id === user?.id}
                          onSave={(dept) => handleDepartmentChange(u._id, dept)}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {isAuditor ? (
                        <Badge variant="outline">{ROLE_LABELS[u.role] || u.role}</Badge>
                      ) : (
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
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'default' : 'secondary'}>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(u._id, !u.isActive)}
                          disabled={updating === u._id || u._id === user?.id}
                        >
                          {updating === u._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : u.isActive ? 'Desactivar' : 'Activar'}
                        </Button>
                      </TableCell>
                    )}
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

      {/* Ticket type definitions */}
      <Card>
        <CardHeader>
          <CardTitle>Definición de Tipos de Ticket</CardTitle>
          <CardDescription>Clasificación ITIL de los tickets según su naturaleza</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Definición</TableHead>
                  <TableHead>Ejemplos</TableHead>
                  <TableHead>Prioridad típica</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><Badge variant="destructive">Incidente</Badge></TableCell>
                  <TableCell>Interrupción no planificada o degradación de un servicio de TI</TableCell>
                  <TableCell>Caída de internet, aplicativo inaccesible, equipo que no enciende</TableCell>
                  <TableCell>Alta / Crítica</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-blue-600 text-white">Solicitud</Badge></TableCell>
                  <TableCell>Petición de un usuario para obtener información, acceso o un servicio estándar</TableCell>
                  <TableCell>Creación de usuario, instalación de software, reset de contraseña</TableCell>
                  <TableCell>Baja / Media</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><Badge className="bg-amber-600 text-white">Problema</Badge></TableCell>
                  <TableCell>Causa raíz desconocida de uno o más incidentes recurrentes</TableCell>
                  <TableCell>Fallas intermitentes de red sin causa identificada, crashes repetidos de ERP</TableCell>
                  <TableCell>Media / Alta</TableCell>
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

      {/* Create user dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crear nuevo usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cu-name">Nombre completo *</Label>
              <Input
                id="cu-name"
                value={form.displayName}
                onChange={(e) => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="Ej: Juan García"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-email">
                Email / Usuario *
                {form.role === 'auditor' && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">(puede ser solo nombre, ej: auditor)</span>
                )}
              </Label>
              <Input
                id="cu-email"
                type="text"
                value={form.email}
                onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder={form.role === 'auditor' ? 'Ej: auditor' : 'usuario@ejemplo.com'}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-password">Contraseña *</Label>
              <Input
                id="cu-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-role">Rol</Label>
              <Select value={form.role} onValueChange={(v) => setForm(f => ({ ...f, role: v as UserRole }))}>
                <SelectTrigger id="cu-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-dept">Departamento</Label>
              <Input
                id="cu-dept"
                value={form.department}
                onChange={(e) => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="Ej: TI, Finanzas..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cu-phone">Teléfono</Label>
              <Input
                id="cu-phone"
                value={form.phone}
                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Ej: +57 300 000 0000"
              />
            </div>
            {createError && (
              <p className="text-sm text-destructive">{createError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} disabled={creating}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Crear usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
