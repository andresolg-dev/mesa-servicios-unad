'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  TrendingUp,
  TrendingDown,
  Filter,
  MoreHorizontal,
  Bell,
  Settings,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { STATUS_LABELS, PRIORITY_LABELS } from '@/lib/types'
import type { TicketStatus, TicketPriority } from '@/lib/types'

interface RecentTicket {
  _id: string
  ticketNumber: string
  title: string
  status: TicketStatus
  priority: TicketPriority
  updatedAt: string
  createdAt: string
}

interface Stats {
  total: number
  abiertos: number
  enProgreso: number
  pendientes: number
  escalados: number
  resueltos: number
  cerrados: number
  slaPercentage: number
  satisfactionAverage: number
  recentTickets: RecentTicket[]
  weeklyTrend: { day: string; tickets: number }[]
}

const statusColors: Record<string, string> = {
  abierto: 'bg-blue-500/10 text-blue-600 border-blue-200',
  en_progreso: 'bg-amber-500/10 text-amber-600 border-amber-200',
  pendiente: 'bg-purple-500/10 text-purple-600 border-purple-200',
  escalado: 'bg-orange-500/10 text-orange-600 border-orange-200',
  resuelto: 'bg-green-500/10 text-green-600 border-green-200',
  cerrado: 'bg-gray-100 text-gray-500 border-gray-200',
}

const priorityDot: Record<string, string> = {
  critica: 'bg-red-500',
  alta: 'bg-orange-500',
  media: 'bg-yellow-500',
  baja: 'bg-slate-400',
}

function MiniSparkline({ positive = true }: { positive?: boolean }) {
  return (
    <svg viewBox="0 0 60 20" className="w-16 h-5 opacity-60">
      {positive ? (
        <polyline
          points="0,18 10,14 20,16 30,10 40,12 50,6 60,4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-green-500"
        />
      ) : (
        <polyline
          points="0,4 10,8 20,6 30,12 40,10 50,16 60,18"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-red-500"
        />
      )}
    </svg>
  )
}

const activityIcons: Record<string, { icon: React.ComponentType<{className?: string}>; color: string }> = {
  abierto:    { icon: Ticket,       color: 'text-blue-500 bg-blue-50' },
  en_progreso:{ icon: Clock,        color: 'text-amber-500 bg-amber-50' },
  escalado:   { icon: AlertCircle,  color: 'text-orange-500 bg-orange-50' },
  resuelto:   { icon: CheckCircle2, color: 'text-green-500 bg-green-50' },
  cerrado:    { icon: CheckCircle2, color: 'text-gray-400 bg-gray-50' },
  pendiente:  { icon: Clock,        color: 'text-purple-500 bg-purple-50' },
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activityTab, setActivityTab] = useState<'today' | 'yesterday' | 'week'>('today')
  const [slaSearch, setSlaSearch] = useState('')

  const isTechnician = user?.role?.startsWith('tecnico') || user?.role === 'admin'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch('/api/tickets/stats')
        const statsData = await statsRes.json()
        if (statsData.stats) setStats(statsData.stats)
      } catch {
        setError('Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-destructive">{error}</p>
          <p className="text-muted-foreground text-sm mt-2">
            Verifique la conexión con la base de datos
          </p>
        </CardContent>
      </Card>
    )
  }

  const totalWeek = stats?.weeklyTrend?.reduce((a, b) => a + b.tickets, 0) || 0
  const chartData = stats?.weeklyTrend || []
  const allRecentTickets = stats?.recentTickets || []

  const recentTickets = allRecentTickets.filter((t) => {
    const updated = new Date(t.updatedAt)
    const now = new Date()
    if (activityTab === 'today') {
      return updated.toDateString() === now.toDateString()
    }
    if (activityTab === 'yesterday') {
      const yesterday = new Date(now)
      yesterday.setDate(now.getDate() - 1)
      return updated.toDateString() === yesterday.toDateString()
    }
    // week
    const weekAgo = new Date(now)
    weekAgo.setDate(now.getDate() - 7)
    return updated >= weekAgo
  })

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hola, {user?.displayName?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Aquí están los últimos datos de tu mesa de servicios.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            Última semana
          </Button>
          <button className="p-2 rounded-md hover:bg-accent transition-colors">
            <Bell className="h-4 w-4 text-muted-foreground" />
          </button>
          <button className="p-2 rounded-md hover:bg-accent transition-colors">
            <Settings className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>

      {/* Breadcrumb */}
      <p className="text-xs text-muted-foreground -mt-2">
        Overview / <span className="text-foreground font-medium">Dashboard</span>
      </p>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Actuales</CardTitle>
            <div className="flex gap-2 items-center">
              <MiniSparkline positive />
              <button><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.total ?? 0}</div>
            <p className={cn(
              "text-xs mt-1 flex items-center gap-1",
              (stats?.abiertos ?? 0) > 0 ? "text-green-600" : "text-muted-foreground"
            )}>
              {(stats?.abiertos ?? 0) > 0
                ? <><TrendingUp className="h-3 w-3" />{stats?.abiertos} abiertos</>
                : <><TrendingDown className="h-3 w-3 text-red-500" />sin nuevos tickets</>
              }
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resueltos (semana)</CardTitle>
            <div className="flex gap-2 items-center">
              <MiniSparkline positive />
              <button><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats?.resueltos ?? 0) + (stats?.cerrados ?? 0)}</div>
            <p className="text-xs mt-1 text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              {stats?.enProgreso ?? 0} en progreso
            </p>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cumplimiento SLA</CardTitle>
            <div className="flex gap-2 items-center">
              <MiniSparkline positive={(stats?.slaPercentage ?? 0) >= 90} />
              <button><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.slaPercentage ?? 100}%</div>
            <p className={cn(
              "text-xs mt-1 flex items-center gap-1",
              (stats?.slaPercentage ?? 100) >= 90 ? "text-green-600" : "text-red-500"
            )}>
              {(stats?.slaPercentage ?? 100) >= 90
                ? <><TrendingUp className="h-3 w-3" />Por encima del objetivo (90%)</>
                : <><TrendingDown className="h-3 w-3" />Por debajo del objetivo (90%)</>
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart + Activity */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Ticket Volume Trend */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Tendencia de Volumen de Tickets
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" className="text-xs text-muted-foreground">
              Última semana
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-4xl font-bold">{totalWeek}</span>
              <span className="text-sm text-green-600 flex items-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3" />
                esta semana
              </span>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={28}>
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v: number) => [v, 'Tickets']}
                  />
                  <Bar
                    dataKey="tickets"
                    fill="#e5e7eb"
                    radius={[4, 4, 0, 0]}
                    // highlight today's bar
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Latest Updates */}
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium">Últimas Actualizaciones</CardTitle>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setActivityTab('today')}
                className={activityTab === 'today' ? 'px-2 py-1 rounded bg-primary text-primary-foreground font-medium' : 'px-2 py-1 rounded text-muted-foreground hover:bg-accent'}
              >Hoy</button>
              <button
                onClick={() => setActivityTab('yesterday')}
                className={activityTab === 'yesterday' ? 'px-2 py-1 rounded bg-primary text-primary-foreground font-medium' : 'px-2 py-1 rounded text-muted-foreground hover:bg-accent'}
              >Ayer</button>
              <button
                onClick={() => setActivityTab('week')}
                className={activityTab === 'week' ? 'px-2 py-1 rounded bg-primary text-primary-foreground font-medium' : 'px-2 py-1 rounded text-muted-foreground hover:bg-accent'}
              >Semana</button>
            </div>
          </CardHeader>
          <CardContent className="px-4">
            <p className="text-xs text-muted-foreground mb-3">
              {recentTickets.length} actividades recientes
            </p>
            <div className="space-y-3">
              {recentTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Sin actividad reciente</p>
              ) : (
                recentTickets.map((t) => {
                  const activity = activityIcons[t.status] || activityIcons.abierto
                  const Icon = activity.icon
                  return (
                    <Link key={t._id} href={`/tickets/${t._id}`} className="flex items-start gap-3 hover:opacity-80 transition-opacity">
                      <div className={cn('p-1.5 rounded-full shrink-0 mt-0.5', activity.color)}>
                        <Icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{t.title}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {t.ticketNumber} · {STATUS_LABELS[t.status] || t.status}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                        {new Date(t.updatedAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </Link>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Monitoring Table */}
      {isTechnician && (
        <Card className="border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Monitoreo SLA
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar ticket"
                  value={slaSearch}
                  onChange={(e) => setSlaSearch(e.target.value)}
                  className="h-8 pl-3 pr-8 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-ring w-40"
                />
              </div>
              <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
                <Filter className="h-3 w-3" />
                Filtrar
              </Button>
              <Link href="/tickets/new">
                <Button size="sm" className="h-8 gap-1 text-xs">
                  <Plus className="h-3 w-3" />
                  Nuevo Ticket
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground">
                      <input type="checkbox" className="rounded" />
                    </th>
                    <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground">ID Ticket</th>
                    <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground">Asunto</th>
                    <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground">Prioridad</th>
                    <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground">Estado</th>
                    <th className="text-left py-2.5 px-4 font-medium text-xs text-muted-foreground">Creado</th>
                    <th className="w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {allRecentTickets.filter(t => {
                    if (!slaSearch) return true
                    const q = slaSearch.toLowerCase()
                    return t.ticketNumber.toLowerCase().includes(q) || t.title.toLowerCase().includes(q)
                  }).slice(0, 5).map((t) => (
                    <tr key={t._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-4">
                        <input type="checkbox" className="rounded" />
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/tickets/${t._id}`} className="font-mono text-xs text-primary hover:underline">
                          {t.ticketNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <Link href={`/tickets/${t._id}`} className="font-medium hover:text-primary transition-colors truncate max-w-[200px] block">
                          {t.title}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={cn('h-2 w-2 rounded-full', priorityDot[t.priority] || 'bg-gray-400')} />
                          <span className="text-xs">{PRIORITY_LABELS[t.priority] || t.priority}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={cn('text-xs border', statusColors[t.status] || '')}>
                          {STATUS_LABELS[t.status] || t.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-xs text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })}
                      </td>
                      <td className="py-3 px-2">
                        <button className="p-1 rounded hover:bg-accent">
                          <MoreHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {recentTickets.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground text-sm">
                        No hay tickets para mostrar
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Client view: recent tickets as cards */}
      {!isTechnician && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Mis Tickets Recientes</h2>
            <Link href="/tickets">
              <Button variant="ghost" size="sm" className="text-xs">Ver todos</Button>
            </Link>
          </div>
          {recentTickets.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tienes tickets</h3>
                <p className="text-muted-foreground text-center mb-4 text-sm">
                  Crea tu primer ticket para reportar un incidente.
                </p>
                <Link href="/tickets/new">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Ticket
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {recentTickets.map((t) => (
                <Link key={t._id} href={`/tickets/${t._id}`}>
                  <Card className="hover:shadow-md hover:border-primary/40 transition-all cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground font-mono">{t.ticketNumber}</p>
                          <p className="font-medium text-sm truncate mt-0.5">{t.title}</p>
                        </div>
                        <Badge variant="outline" className={cn('text-xs shrink-0', statusColors[t.status])}>
                          {STATUS_LABELS[t.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className={cn('h-1.5 w-1.5 rounded-full', priorityDot[t.priority])} />
                        <span className="text-xs text-muted-foreground">{PRIORITY_LABELS[t.priority]}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
