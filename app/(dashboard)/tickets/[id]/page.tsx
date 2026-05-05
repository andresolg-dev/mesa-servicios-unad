'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TicketDetail } from '@/components/ticket-detail'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'

interface TicketData {
  _id: string
  ticketNumber: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  createdBy: string
  createdByName: string
  createdByEmail: string
  assignedTo?: string
  assignedToName?: string
  assignedLevel: string
  comments: Array<{
    userId: string
    userName: string
    userRole: string
    content: string
    isInternal: boolean
    createdAt: string
  }>
  escalationHistory: Array<{
    fromLevel: string
    toLevel: string
    reason: string
    escalatedBy: string
    escalatedByName: string
    escalatedAt: string
  }>
  satisfactionSurvey?: {
    rating: number
    comment?: string
    submittedAt: string
  }
  slaDeadline: string
  resolvedAt?: string
  closedAt?: string
  createdAt: string
  updatedAt: string
}

export default function TicketDetailPage() {
  const params = useParams()
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTicket = useCallback(async () => {
    try {
      const res = await fetch(`/api/tickets/${params.id}`)
      const data = await res.json()
      if (data.ticket) {
        setTicket(data.ticket)
      }
    } catch (err) {
      console.error('Error fetching ticket:', err)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    fetchTicket()
  }, [fetchTicket])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Ticket no encontrado</h2>
        <p className="text-muted-foreground mb-4">El ticket solicitado no existe o fue eliminado.</p>
        <Link href="/tickets">
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Tickets
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/tickets">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detalle del Ticket</h1>
          <p className="text-muted-foreground">{ticket.ticketNumber}</p>
        </div>
      </div>

      <TicketDetail ticket={ticket as never} onUpdate={fetchTicket} />
    </div>
  )
}
