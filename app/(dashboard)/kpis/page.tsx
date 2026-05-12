'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { KPIDashboard } from '@/components/kpi-dashboard'
import { Loader2 } from 'lucide-react'
import type { SurveyRecord } from '@/lib/types'

interface StatsData {
  total: number
  abiertos: number
  enProgreso: number
  pendientes: number
  escalados: number
  resueltos: number
  cerrados: number
  slaPercentage: number
  categoryDistribution: Record<string, number>
  priorityDistribution: Record<string, number>
  satisfactionAverage: number
  satisfactionCount: number
  levelDistribution: Record<number, number>
  typeDistribution: Record<string, number>
}

export default function KPIsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [surveys, setSurveys] = useState<SurveyRecord[]>([])
  const [loading, setLoading] = useState(true)

  const canView = user && user.role !== 'cliente'

  useEffect(() => {
    if (!authLoading && user && user.role === 'cliente') {
      router.replace('/dashboard')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (!canView) return

    const fetchAll = async () => {
      try {
        const [statsRes, surveysRes] = await Promise.all([
          fetch('/api/tickets/stats'),
          fetch('/api/surveys'),
        ])
        const statsData = await statsRes.json()
        const surveysData = await surveysRes.json()
        if (statsData.stats) setStats(statsData.stats)
        if (surveysData.surveys) setSurveys(surveysData.surveys)
      } catch (err) {
        console.error('Error fetching KPI data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [canView])

  if (authLoading || user?.role === 'cliente') return null

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error al cargar las métricas</p>
      </div>
    )
  }

  const metrics = {
    totalTickets: stats.total,
    openTickets: stats.abiertos,
    inProgressTickets: stats.enProgreso,
    resolvedTickets: stats.resueltos,
    closedTickets: stats.cerrados,
    averageResponseTime: 0,
    averageResolutionTime: 0,
    slaComplianceRate: stats.slaPercentage,
    customerSatisfactionScore: stats.satisfactionAverage,
    satisfactionCount: stats.satisfactionCount,
    ticketsByCategory: stats.categoryDistribution,
    ticketsByPriority: stats.priorityDistribution,
    ticketsByLevel: stats.levelDistribution,
    ticketsByType: stats.typeDistribution || {},
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">KPIs y Métricas</h1>
        <p className="text-muted-foreground">
          Indicadores clave de rendimiento de la Mesa de Servicios
        </p>
      </div>
      <KPIDashboard metrics={metrics} surveys={surveys} />
    </div>
  )
}
