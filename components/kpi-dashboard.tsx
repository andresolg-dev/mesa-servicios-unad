'use client'

import { useState } from 'react'
import Chart from 'react-apexcharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Ticket,
  CheckCircle2,
  Target,
  Star,
  Copy,
  Check,
  ClipboardList,
  BarChart3,
  TrendingUp,
} from 'lucide-react'
import { CATEGORY_LABELS, PRIORITY_LABELS, TYPE_LABELS } from '@/lib/types'
import type { SurveyRecord } from '@/lib/types'

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
  satisfactionCount: number
  ticketsByCategory: Record<string, number>
  ticketsByPriority: Record<string, number>
  ticketsByLevel: Record<number, number>
  ticketsByType: Record<string, number>
}

interface KPIDashboardProps {
  metrics: KPIMetrics
  surveys: SurveyRecord[]
}

const COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  secondary: '#8b5cf6',
  info: '#06b6d4',
  neutral: '#6b7280'
}

const STAR_COLORS = ['', '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e']

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className="h-4 w-4"
          fill={s <= rating ? STAR_COLORS[rating] : '#e5e7eb'}
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Button variant="outline" size="sm" onClick={copy} className="gap-1.5">
      {copied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? 'Copiado' : (label || 'Copiar texto')}
    </Button>
  )
}

function generateReportText(metrics: KPIMetrics, surveys: SurveyRecord[]): string {
  const sla = metrics.slaComplianceRate.toFixed(1)
  const sat = metrics.customerSatisfactionScore > 0 ? metrics.customerSatisfactionScore.toFixed(1) : 'N/D'
  const resolved = metrics.resolvedTickets + metrics.closedTickets
  const resRate = metrics.totalTickets > 0
    ? ((resolved / metrics.totalTickets) * 100).toFixed(1)
    : '0.0'

  const topCategory = Object.entries(metrics.ticketsByCategory)
    .sort((a, b) => b[1] - a[1])[0]
  const topCategoryLabel = topCategory
    ? (CATEGORY_LABELS[topCategory[0] as keyof typeof CATEGORY_LABELS] || topCategory[0])
    : 'N/D'

  const criticalCount = metrics.ticketsByPriority['critica'] || 0

  return `3.3 Informe de KPIs y Métricas

A continuación, se presentan los indicadores clave de rendimiento obtenidos durante la fase de operación de la mesa de servicios TecnoColombia S.A.S.:

1. Porcentaje de cumplimiento de SLA
   Resultado: ${sla}%
   Análisis: La mesa de servicios ${parseFloat(sla) >= 95 ? 'mantiene un alto estándar de eficiencia, resolviendo la gran mayoría de los incidentes dentro de los tiempos pactados' : 'presenta oportunidades de mejora en el cumplimiento de los tiempos de resolución acordados'}. El ${(100 - parseFloat(sla)).toFixed(1)}% restante ${parseFloat(sla) >= 95 ? 'se atribuye a incidentes complejos que requirieron escalamiento a Nivel 3 o proveedores externos' : 'corresponde a casos que excedieron los tiempos de SLA y requieren análisis de causa raíz'}.

2. Tasa de resolución de tickets
   Resultado: ${resRate}% (${resolved} de ${metrics.totalTickets} tickets resueltos o cerrados)
   Análisis: ${parseFloat(resRate) >= 80 ? 'El equipo de soporte demuestra alta capacidad de resolución, atendiendo efectivamente la mayor parte de los casos reportados.' : 'Se requiere reforzar la capacidad de resolución del equipo para mejorar el índice de tickets cerrados.'}

3. Satisfacción del cliente (CSAT)
   Resultado: ${sat}/5 (basado en ${metrics.satisfactionCount} encuesta${metrics.satisfactionCount !== 1 ? 's' : ''})
   Análisis: ${metrics.customerSatisfactionScore >= 4 ? 'Los usuarios expresan un alto nivel de satisfacción con el servicio recibido, lo que refleja la calidad de la atención brindada por el equipo técnico.' : metrics.customerSatisfactionScore >= 3 ? 'La satisfacción del cliente se encuentra en un nivel aceptable, con espacio de mejora en la calidad percibida del servicio.' : 'La satisfacción del cliente requiere atención prioritaria para identificar y corregir los factores que afectan la experiencia del usuario.'}

4. Distribución de tickets por categoría
   Categoría más frecuente: ${topCategoryLabel} (${topCategory ? topCategory[1] : 0} tickets)
   Análisis: La concentración de incidencias en ${topCategoryLabel} indica una oportunidad de mejora mediante capacitación preventiva y documentación de soluciones frecuentes.

5. Incidentes críticos
   Total: ${criticalCount} ticket${criticalCount !== 1 ? 's' : ''} de prioridad crítica
   Análisis: ${criticalCount === 0 ? 'No se registraron incidentes críticos durante el período evaluado, lo que refleja la estabilidad del entorno tecnológico.' : `Se registraron ${criticalCount} incidente${criticalCount !== 1 ? 's' : ''} crítico${criticalCount !== 1 ? 's' : ''}, atendido${criticalCount !== 1 ? 's' : ''} con escalamiento inmediato al nivel técnico correspondiente.`}

--- Puntos fuertes ---
${parseFloat(sla) >= 95 ? '• Alto cumplimiento de SLA, superando la meta del 95%.\n' : ''}${parseFloat(resRate) >= 80 ? '• Elevada tasa de resolución de tickets.\n' : ''}${metrics.customerSatisfactionScore >= 4 ? '• Satisfacción del cliente por encima del promedio.\n' : ''}• Clasificación ITIL implementada correctamente (Incidente, Solicitud, Problema).
• Estructura de escalamiento en tres niveles operativa.

--- Áreas de mejora ---
${parseFloat(sla) < 95 ? '• Incrementar el cumplimiento de SLA para alcanzar la meta del 95%.\n' : ''}${parseFloat(resRate) < 80 ? '• Aumentar la tasa de resolución, reduciendo el backlog de tickets abiertos.\n' : ''}${metrics.customerSatisfactionScore < 4 && metrics.customerSatisfactionScore > 0 ? '• Mejorar la satisfacción del cliente mediante seguimiento post-cierre.\n' : ''}• Implementar base de conocimiento para reducir tiempo de resolución en categorías frecuentes.
• Fortalecer capacitación técnica en las categorías con mayor volumen de incidentes.`
}

// ─── Tab: Dashboard ──────────────────────────────────────────────────────────

function DashboardTab({ metrics }: { metrics: KPIMetrics }) {
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
    .map(([key, value]) => ({ name: `Nivel ${key}`, value: value || 0 }))
    .sort((a, b) => parseInt(a.name.split(' ')[1]) - parseInt(b.name.split(' ')[1]))

  const typeData = Object.entries(metrics.ticketsByType || {})
    .map(([key, value]) => ({
      name: TYPE_LABELS[key as keyof typeof TYPE_LABELS] || key,
      value
    }))
    .filter(item => item.value > 0)

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
            <CardTitle className="text-sm font-medium">Cumplimiento SLA</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.slaComplianceRate >= 95 ? 'text-green-600' : metrics.slaComplianceRate >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
              {metrics.slaComplianceRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Meta: 95%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfacción del Cliente</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.customerSatisfactionScore > 0 ? metrics.customerSatisfactionScore.toFixed(1) : 'N/D'}/5
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.satisfactionCount} encuesta{metrics.satisfactionCount !== 1 ? 's' : ''} recibida{metrics.satisfactionCount !== 1 ? 's' : ''}
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

      {/* Charts Row 1 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Distribución por Estado</CardTitle></CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <Chart
                options={{
                  chart: { fontFamily: 'inherit', toolbar: { show: false } },
                  labels: statusData.map(d => d.name),
                  colors: statusData.map(d => d.color),
                  plotOptions: { pie: { donut: { size: '65%', labels: { show: true, total: { show: true, fontSize: '14px', color: 'hsl(var(--muted-foreground))', label: 'Total' } } } } },
                  legend: { position: 'bottom' as const, fontSize: '13px', fontFamily: 'inherit' }
                }}
                series={statusData.map(d => d.value)}
                type="donut"
                height={320}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground"><p>Sin datos disponibles</p></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tickets por Categoría</CardTitle></CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <Chart
                options={{
                  chart: { fontFamily: 'inherit', toolbar: { show: false }, type: 'bar' },
                  xaxis: { categories: categoryData.map(d => d.name), labels: { style: { colors: 'hsl(var(--muted-foreground))', fontSize: '12px' } } },
                  yaxis: { title: { text: 'Cantidad' }, labels: { style: { colors: 'hsl(var(--muted-foreground))', fontSize: '12px' } } },
                  plotOptions: { bar: { horizontal: false, columnWidth: '65%', borderRadius: 8 } },
                  colors: [COLORS.primary],
                  dataLabels: { enabled: false },
                  legend: { position: 'bottom' as const, fontSize: '13px', fontFamily: 'inherit' }
                }}
                series={[{ name: 'Tickets', data: categoryData.map(d => d.value) }]}
                type="bar"
                height={320}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground"><p>Sin datos disponibles</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Tickets por Prioridad</CardTitle></CardHeader>
          <CardContent>
            {priorityData.length > 0 ? (
              <Chart
                options={{
                  chart: { fontFamily: 'inherit', toolbar: { show: false } },
                  labels: priorityData.map(d => d.name),
                  colors: [COLORS.neutral, COLORS.warning, COLORS.danger, '#dc2626'],
                  legend: { position: 'bottom' as const, fontSize: '13px', fontFamily: 'inherit' },
                  dataLabels: { enabled: false }
                }}
                series={priorityData.map(d => d.value)}
                type="pie"
                height={320}
              />
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground"><p>Sin datos disponibles</p></div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Tickets por Nivel de Soporte</CardTitle></CardHeader>
          <CardContent>
            {levelData.some(d => d.value > 0) ? (
              <Chart
                options={{
                  chart: { fontFamily: 'inherit', toolbar: { show: false }, type: 'bar' },
                  xaxis: { categories: levelData.map(d => d.name), labels: { style: { colors: 'hsl(var(--muted-foreground))', fontSize: '12px' } } },
                  yaxis: { labels: { style: { colors: 'hsl(var(--muted-foreground))', fontSize: '12px' } } },
                  plotOptions: { bar: { horizontal: true, columnWidth: '65%', borderRadius: 8 } },
                  colors: [COLORS.success],
                  dataLabels: { enabled: false },
                  legend: { position: 'bottom' as const, fontSize: '13px', fontFamily: 'inherit' }
                }}
                series={[{ name: 'Tickets', data: levelData.map(d => d.value) }]}
                type="bar"
                height={250}
              />
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground"><p>Sin datos disponibles</p></div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Ticket Type */}
      <Card>
        <CardHeader><CardTitle>Tickets por Tipo (Incidente / Solicitud / Problema)</CardTitle></CardHeader>
        <CardContent>
          {typeData.length > 0 ? (
            <Chart
              options={{
                chart: { fontFamily: 'inherit', toolbar: { show: false } },
                labels: typeData.map(d => d.name),
                colors: [COLORS.danger, COLORS.primary, COLORS.warning],
                legend: { position: 'bottom' as const, fontSize: '13px', fontFamily: 'inherit' },
                dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` }
              }}
              series={typeData.map(d => d.value)}
              type="pie"
              height={300}
            />
          ) : (
            <div className="h-72 flex items-center justify-center text-muted-foreground"><p>Sin datos disponibles</p></div>
          )}
        </CardContent>
      </Card>

      {/* SLA Table */}
      <Card>
        <CardHeader><CardTitle>Acuerdos de Nivel de Servicio (SLA)</CardTitle></CardHeader>
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

// ─── Tab: Encuestas ───────────────────────────────────────────────────────────

function EncuestasTab({ surveys }: { surveys: SurveyRecord[] }) {
  const avg = surveys.length > 0
    ? surveys.reduce((s, r) => s + r.satisfactionSurvey.rating, 0) / surveys.length
    : 0

  const dist = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: surveys.filter(s => s.satisfactionSurvey.rating === r).length,
  }))

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total encuestas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{surveys.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Puntuación promedio</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avg > 0 ? avg.toFixed(2) : 'N/D'}/5</div>
            {avg > 0 && <StarRating rating={Math.round(avg)} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distribución de calificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {dist.map(({ rating, count }) => (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-4 text-right text-muted-foreground">{rating}</span>
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-amber-400"
                      style={{ width: surveys.length > 0 ? `${(count / surveys.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="w-4 text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Surveys list */}
      {surveys.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Aún no hay encuestas de satisfacción registradas.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Detalle de encuestas ({surveys.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2 px-3 font-medium">Ticket</th>
                    <th className="py-2 px-3 font-medium">Título</th>
                    <th className="py-2 px-3 font-medium">Usuario</th>
                    <th className="py-2 px-3 font-medium">Categoría</th>
                    <th className="py-2 px-3 font-medium">Calificación</th>
                    <th className="py-2 px-3 font-medium">Comentario</th>
                    <th className="py-2 px-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {surveys.map((s) => (
                    <tr key={s._id} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{s.ticketNumber}</td>
                      <td className="py-2 px-3 max-w-[200px] truncate">{s.title}</td>
                      <td className="py-2 px-3 text-muted-foreground">{s.createdByName || s.createdByEmail}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-xs">
                          {CATEGORY_LABELS[s.category as keyof typeof CATEGORY_LABELS] || s.category}
                        </Badge>
                      </td>
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-1.5">
                          <StarRating rating={s.satisfactionSurvey.rating} />
                          <span className="text-xs text-muted-foreground">({s.satisfactionSurvey.rating})</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 max-w-[220px]">
                        {s.satisfactionSurvey.comment ? (
                          <span className="text-sm italic text-muted-foreground">"{s.satisfactionSurvey.comment}"</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin comentario</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(s.satisfactionSurvey.submittedAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ─── Tab: Medición y Mejora ───────────────────────────────────────────────────

function MedicionTab({ metrics, surveys }: { metrics: KPIMetrics; surveys: SurveyRecord[] }) {
  const sla = metrics.slaComplianceRate
  const resolved = metrics.resolvedTickets + metrics.closedTickets
  const resRate = metrics.totalTickets > 0 ? (resolved / metrics.totalTickets) * 100 : 0
  const sat = metrics.customerSatisfactionScore

  const slaStatus = sla >= 95 ? 'success' : sla >= 80 ? 'warning' : 'danger'
  const resStatus = resRate >= 80 ? 'success' : resRate >= 60 ? 'warning' : 'danger'
  const satStatus = sat >= 4 ? 'success' : sat >= 3 ? 'warning' : sat > 0 ? 'danger' : 'neutral'

  const statusColor = {
    success: 'text-green-700 bg-green-50 border-green-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    danger: 'text-red-700 bg-red-50 border-red-200',
    neutral: 'text-slate-600 bg-slate-50 border-slate-200',
  }

  const fullReport = generateReportText(metrics, surveys)

  const slaParagraph = `1. Porcentaje de cumplimiento de SLA
   Resultado: ${sla.toFixed(1)}%
   Análisis: La mesa de servicios ${sla >= 95 ? 'mantiene un alto estándar de eficiencia, resolviendo la gran mayoría de los incidentes dentro de los tiempos pactados' : 'presenta oportunidades de mejora en el cumplimiento de los tiempos de resolución acordados'}. El ${(100 - sla).toFixed(1)}% restante ${sla >= 95 ? 'se atribuye a incidentes complejos que requirieron escalamiento a Nivel 3 o proveedores externos' : 'corresponde a casos que excedieron los tiempos de SLA y requieren análisis de causa raíz'}.`

  return (
    <div className="space-y-6">
      {/* KPI summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className={`rounded-lg border p-4 ${statusColor[slaStatus]}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">Cumplimiento SLA</span>
            <Target className="h-4 w-4" />
          </div>
          <div className="text-3xl font-bold mb-0.5">{sla.toFixed(1)}%</div>
          <div className="text-xs">Meta: 95% — {sla >= 95 ? 'Cumplida' : sla >= 80 ? 'Por mejorar' : 'Crítica'}</div>
        </div>
        <div className={`rounded-lg border p-4 ${statusColor[resStatus]}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">Tasa de resolución</span>
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="text-3xl font-bold mb-0.5">{resRate.toFixed(1)}%</div>
          <div className="text-xs">{resolved} de {metrics.totalTickets} tickets cerrados</div>
        </div>
        <div className={`rounded-lg border p-4 ${statusColor[satStatus]}`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold">Satisfacción CSAT</span>
            <Star className="h-4 w-4" />
          </div>
          <div className="text-3xl font-bold mb-0.5">{sat > 0 ? sat.toFixed(1) : 'N/D'}/5</div>
          <div className="text-xs">{metrics.satisfactionCount} encuesta{metrics.satisfactionCount !== 1 ? 's' : ''} recibida{metrics.satisfactionCount !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {/* SLA compliance — copyable */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              1. Porcentaje de cumplimiento de SLA
            </CardTitle>
          </div>
          <CopyButton text={slaParagraph} />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-bold ${sla >= 95 ? 'text-green-600' : sla >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
              {sla.toFixed(1)}%
            </span>
            <Badge variant={sla >= 95 ? 'default' : 'secondary'} className={sla >= 95 ? 'bg-green-600' : sla >= 80 ? 'bg-amber-500' : 'bg-red-600 text-white'}>
              {sla >= 95 ? 'Meta alcanzada' : sla >= 80 ? 'Por mejorar' : 'Crítico'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Análisis:</strong> La mesa de servicios {sla >= 95
              ? 'mantiene un alto estándar de eficiencia, resolviendo la gran mayoría de los incidentes dentro de los tiempos pactados'
              : 'presenta oportunidades de mejora en el cumplimiento de los tiempos de resolución acordados'}.
            El {(100 - sla).toFixed(1)}% restante {sla >= 95
              ? 'se atribuye a incidentes complejos que requirieron escalamiento a Nivel 3 o proveedores externos'
              : 'corresponde a casos que excedieron los tiempos de SLA y requieren análisis de causa raíz'}.
          </p>
        </CardContent>
      </Card>

      {/* Resolution rate */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            2. Tasa de resolución de tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-bold ${resRate >= 80 ? 'text-green-600' : resRate >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
              {resRate.toFixed(1)}%
            </span>
            <span className="text-muted-foreground text-sm">({resolved} de {metrics.totalTickets} tickets)</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Análisis:</strong> {resRate >= 80
              ? 'El equipo de soporte demuestra alta capacidad de resolución, atendiendo efectivamente la mayor parte de los casos reportados.'
              : 'Se requiere reforzar la capacidad de resolución del equipo para mejorar el índice de tickets cerrados.'}
          </p>
        </CardContent>
      </Card>

      {/* CSAT */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            3. Satisfacción del cliente (CSAT)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`text-4xl font-bold ${sat >= 4 ? 'text-green-600' : sat >= 3 ? 'text-amber-600' : sat > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              {sat > 0 ? sat.toFixed(1) : 'N/D'}
            </span>
            <span className="text-muted-foreground text-sm">/ 5 — {metrics.satisfactionCount} encuesta{metrics.satisfactionCount !== 1 ? 's' : ''}</span>
          </div>
          {sat > 0 && <StarRating rating={Math.round(sat)} />}
          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Análisis:</strong> {sat >= 4
              ? 'Los usuarios expresan un alto nivel de satisfacción con el servicio recibido, lo que refleja la calidad de la atención brindada por el equipo técnico.'
              : sat >= 3
              ? 'La satisfacción del cliente se encuentra en un nivel aceptable, con espacio de mejora en la calidad percibida del servicio.'
              : sat > 0
              ? 'La satisfacción del cliente requiere atención prioritaria para identificar y corregir los factores que afectan la experiencia del usuario.'
              : 'Aún no hay encuestas de satisfacción registradas para calcular este indicador.'}
          </p>
        </CardContent>
      </Card>

      {/* Puntos fuertes y mejora */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <TrendingUp className="h-4 w-4" />
              Puntos fuertes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {sla >= 95 && <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Alto cumplimiento de SLA — supera la meta del 95%.</li>}
              {resRate >= 80 && <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Elevada tasa de resolución de tickets ({resRate.toFixed(1)}%).</li>}
              {sat >= 4 && <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Satisfacción del cliente por encima del promedio ({sat.toFixed(1)}/5).</li>}
              <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Clasificación ITIL implementada correctamente (Incidente, Solicitud, Problema).</li>
              <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Estructura de escalamiento en tres niveles operativa y funcional.</li>
              <li className="flex gap-2"><span className="text-green-600 font-bold">•</span> Registro completo y trazable de todos los tickets del sistema.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700">
              <BarChart3 className="h-4 w-4" />
              Áreas de mejora
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {sla < 95 && <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Incrementar cumplimiento de SLA hasta alcanzar la meta del 95%.</li>}
              {resRate < 80 && <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Aumentar tasa de resolución, reduciendo el backlog de tickets abiertos.</li>}
              {sat < 4 && sat > 0 && <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Mejorar satisfacción del cliente mediante seguimiento post-cierre.</li>}
              {metrics.satisfactionCount < 5 && <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Incentivar la participación de usuarios en las encuestas de satisfacción.</li>}
              <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Implementar base de conocimiento para reducir tiempos en categorías frecuentes.</li>
              <li className="flex gap-2"><span className="text-amber-600 font-bold">•</span> Fortalecer capacitación técnica en las categorías con mayor volumen de incidentes.</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Full report — copyable */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Informe completo para documento</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Texto listo para copiar y pegar en el informe de la asignatura</p>
          </div>
          <CopyButton text={fullReport} label="Copiar informe" />
        </CardHeader>
        <CardContent>
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono bg-muted/50 rounded-lg p-4 leading-relaxed border">
            {fullReport}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

type Tab = 'dashboard' | 'encuestas' | 'medicion'

export function KPIDashboard({ metrics, surveys }: KPIDashboardProps) {
  const [tab, setTab] = useState<Tab>('dashboard')

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'encuestas', label: `Encuestas (${surveys.length})`, icon: ClipboardList },
    { id: 'medicion', label: 'Medición y Mejora', icon: TrendingUp },
  ]

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b pb-0">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <DashboardTab metrics={metrics} />}
      {tab === 'encuestas' && <EncuestasTab surveys={surveys} />}
      {tab === 'medicion' && <MedicionTab metrics={metrics} surveys={surveys} />}
    </div>
  )
}
