'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Star,
  Target
} from 'lucide-react'
import { CATEGORY_LABELS, PRIORITY_LABELS } from '@/lib/types'

interface KPIMetrics {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  closedTickets: number
  averageResponseTime: number
  averageResolutionTime: number
  slaComplianceRate: number
  customerSatisfactionScore: number
  ticketsByCategory: Record<string, number>
  ticketsByPriority: Record<string, number>
  ticketsByLevel: Record<number, number>
}

interface KPIDashboardProps {
  metrics: KPIMetrics
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export function KPIDashboard({ metrics }: KPIDashboardProps) {
  const categoryData = Object.entries(metrics.ticketsByCategory).map(([key, value]) => ({
    name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] || key,
    value
  }))

  const priorityData = Object.entries(metrics.ticketsByPriority).map(([key, value]) => ({
    name: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS] || key,
    value
  }))

  const levelData = Object.entries(metrics.ticketsByLevel).map(([key, value]) => ({
    name: `Nivel ${key}`,
    value
  }))

  const statusData = [
    { name: 'Abiertos', value: metrics.openTickets, color: '#3b82f6' },
    { name: 'En Progreso', value: metrics.inProgressTickets, color: '#f59e0b' },
    { name: 'Resueltos', value: metrics.resolvedTickets, color: '#10b981' },
    { name: 'Cerrados', value: metrics.closedTickets, color: '#6b7280' }
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.openTickets} abiertos, {metrics.inProgressTickets} en progreso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Cumplimiento SLA</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.slaComplianceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Meta: 95%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción del Cliente</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.customerSatisfactionScore.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              Basado en encuestas de satisfacción
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Resueltos</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.resolvedTickets + metrics.closedTickets}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalTickets > 0 
                ? ((metrics.resolvedTickets + metrics.closedTickets) / metrics.totalTickets * 100).toFixed(1)
                : 0}% del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Prioridad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Level Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Nivel de Soporte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={levelData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }}
                    width={70}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLA Table */}
      <Card>
        <CardHeader>
          <CardTitle>Acuerdos de Nivel de Servicio (SLA)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Prioridad</th>
                  <th className="text-left py-3 px-4 font-medium">Tiempo de Respuesta</th>
                  <th className="text-left py-3 px-4 font-medium">Tiempo de Resolución</th>
                  <th className="text-left py-3 px-4 font-medium">Descripción</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-slate-100 rounded text-slate-700">Baja</span></td>
                  <td className="py-3 px-4">8 horas</td>
                  <td className="py-3 px-4">48 horas</td>
                  <td className="py-3 px-4 text-muted-foreground">Incidentes menores sin impacto crítico</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-yellow-100 rounded text-yellow-700">Media</span></td>
                  <td className="py-3 px-4">4 horas</td>
                  <td className="py-3 px-4">24 horas</td>
                  <td className="py-3 px-4 text-muted-foreground">Incidentes con impacto moderado</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-orange-100 rounded text-orange-700">Alta</span></td>
                  <td className="py-3 px-4">1 hora</td>
                  <td className="py-3 px-4">8 horas</td>
                  <td className="py-3 px-4 text-muted-foreground">Incidentes con alto impacto en operaciones</td>
                </tr>
                <tr>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-red-100 rounded text-red-700">Crítica</span></td>
                  <td className="py-3 px-4">15 minutos</td>
                  <td className="py-3 px-4">2 horas</td>
                  <td className="py-3 px-4 text-muted-foreground">Incidentes críticos que afectan el negocio</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
