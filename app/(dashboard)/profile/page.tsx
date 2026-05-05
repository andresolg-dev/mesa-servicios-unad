'use client'

import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield, Building } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/types'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  const permissions: Record<string, string[]> = {
    cliente: [
      'Crear tickets de soporte',
      'Ver mis tickets',
      'Agregar comentarios',
      'Cerrar tickets resueltos',
      'Calificar el servicio',
    ],
    tecnico_n1: [
      'Ver tickets de Nivel 1',
      'Tomar y resolver tickets básicos',
      'Escalar a Nivel 2',
      'Agregar comentarios internos',
      'Ver KPIs',
    ],
    tecnico_n2: [
      'Ver tickets de Nivel 1 y 2',
      'Diagnósticos avanzados',
      'Escalar a Nivel 3',
      'Agregar comentarios internos',
      'Ver KPIs',
    ],
    tecnico_n3: [
      'Ver todos los tickets',
      'Resolver problemas críticos',
      'Intervención de infraestructura',
      'Agregar comentarios internos',
      'Ver KPIs',
    ],
    admin: [
      'Gestión completa de tickets',
      'Administrar usuarios y roles',
      'Configurar SLAs',
      'Ver y analizar KPIs',
      'Acceso total al sistema',
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">Información de tu cuenta</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{user.displayName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Correo Electrónico</p>
              <p className="font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user.email}
              </p>
            </div>
            {user.department && (
              <div>
                <p className="text-sm text-muted-foreground">Departamento</p>
                <p className="font-medium flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  {user.department}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Rol y Permisos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Rol Asignado</p>
              <Badge className="mt-1">{ROLE_LABELS[user.role]}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Permisos del Rol</CardTitle>
            <CardDescription>
              Acciones que puedes realizar según tu rol asignado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(permissions[user.role] || []).map((perm) => (
                <div key={perm} className="flex items-center gap-2 text-sm">
                  <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
                  {perm}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
