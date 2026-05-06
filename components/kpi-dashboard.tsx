'use client'

import Chart from 'react-apexcharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

// Paleta de colores profesional
const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#8b5cf6',
  info: '#06b6d4',
  neutral: '#6b7280'
}

export function KPIDashboard({ metrics }: KPIDashboardProps) {
  const categoryData = Object.entries(metrics.ticketsByCategory)
    .map(([key, value]) => ({
      name: CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] || key,
      value
    }))
    .filter(item => item.value > 0)

  const priorityData = Object.entries(metrics.ticketsByPriority)
    .map(([key, value]) => ({
      name: PRIORITY_LABELS[key as keyof typeof PRIORITY_LABELS] || key,
      value
    }))
    .filter(item => item.value > 0)

  const levelData = Object.entries(metrics.ticketsByLevel)
    .map(([key, value]) => ({
      name: `Nivel ${key}`,
      value: value || 0
    }))
    .sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]))

  const statusData = [
    { name: 'Abiertos', value: metrics.openTickets, color: COLORS.primary },
    { name: 'En Progreso', value: metrics.inProgressTickets, color: COLORS.warning },
    { name: 'Resueltos', value: metrics.resolvedTickets, color: COLORS.success },
    { name: 'Cerrados', value: metrics.closedTickets, color: COLORS.neutral }
  ].filter(item => item.value > 0)

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
        {/* Status Distribution - Donut Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <Chart
                options={{
                  chart: {
                    fontFamily: 'inherit',
                    toolbar: { show: false },
                  },
                  labels: statusData.map(d => d.name),
                  colors: statusData.map(d => d.color),
                  plotOptions: {
                    pie: {
                      donut: {
                        size: '65%',
                        labels: {
                          show: true,
                          total: {
                            show: true,
                            fontSize: '14px',
                            color: 'hsl(var(--muted-foreground))',
                            label: 'Total'
                          }
                        }
                      }
                    }
                  },
                  legend: {
                    position: 'bottom' as const,
                    fontSize: 13,
                    fontFamily: 'inherit'
                  }
                }}
                series={statusData.map(d => d.value)}
                type="donut"
                height={320}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <p>Sin datos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Distribution - Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <Chart
                options={{
                  chart: {
                    fontFamily: 'inherit',
                    toolbar: { show: false },
                    type: 'bar'
                  },
                  xaxis: {
                    categories: categoryData.map(d => d.name),
                    labels: {
                      style: {
                        colors: 'hsl(var(--muted-foreground))',
                        fontSize: '12px'
                      }
                    }
                  },
                  yaxis: {
                    title: { text: 'Cantidad' },
                    labels: {
                      style: {
                        colors: 'hsl(var(--muted-foreground))',
                        fontSize: '12px'
                      }
                    }
                  },
                  plotOptions: {
                    bar: {
                      horizontal: false,
                      columnWidth: '65%',
                      borderRadius: 8
                    }
                  },
                  colors: [COLORS.primary],
                  dataLabels: { enabled: false },
                  legend: { position: 'bottom' as const, fontSize: 13, fontFamily: 'inherit' }
                }}
                series={[
                  {
                    name: 'Tickets',
                    data: categoryData.map(d => d.value)
                  }
                ]}
                type="bar"
                height={320}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <p>Sin datos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Priority Distribution - Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Prioridad</CardTitle>
          </CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <Chart
                options={{
                  chart: {
                    fontFamily: 'inherit',
                    toolbar: { show: false },
                  },
                  labels: priorityData.map(d => d.name),
                  colors: [COLORS.neutral, COLORS.warning, COLORS.danger, '#dc2626'],
                  legend: {
                    position: 'bottom' as const,
                    fontSize: 13,
                    fontFamily: 'inherit'
                  },
                  dataLabels: { enabled: false }
                }}
                series={priorityData.map(d => d.value)}
                type="pie"
                height={320}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <p>Sin datos disponibles</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Level Distribution - Horizontal Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets por Nivel de Soporte</CardTitle>
          </CardHeader>
          <CardContent>
            {levelData.some(d => d.value > 0) ? (
              <Chart
                options={{
                  chart: {
                    fontFamily: 'inherit',
                    toolbar: { show: false },
                    type: 'bar'
                  },
                  xaxis: {
                    categories: levelData.map(d => d.name),
                    labels: {
                      style: {
                        colors: 'hsl(var(--muted-foreground))',
                        fontSize: '12px'
                      }
                    }
                  },
                  yaxis: {
                    labels: {
                      style: {
                        colors: 'hsl(var(--muted-foreground))',
                        fontSize: '12px'
                      }
                    }
                  },
                  plotOptions: {
                    bar: {
                      horizontal: true,
                      columnWidth: '65%',
                      borderRadius: 8
                    }
                  },
                  colors: [COLORS.success],
                  dataLabels: { enabled: false },
                  legend: { position: 'bottom' as const, fontSize: 13, fontFamily: 'inherit' }
                }}
                series={[
                  {
                    name: 'Tickets',
                    data: levelData.map(d => d.value)
                  }
                ]}
                type="bar"
                height={250}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground">
                <p>Sin datos disponibles</p>
              </div>
            )}
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
