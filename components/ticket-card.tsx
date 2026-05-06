'use client'

import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  CircleDashed,
  ArrowUpCircle,
  XCircle,
  Pause
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/types'
import type { TicketStatus, TicketPriority, TicketCategory } from '@/lib/types'

interface TicketData {
  _id: string
  ticketNumber: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  createdByName: string
  createdByEmail: string
  assignedToName?: string
  assignedLevel?: string
  slaDeadline: string
  createdAt: string
}

interface TicketCardProps {
  ticket: TicketData
}

const statusIcons: Record<TicketStatus, React.ComponentType<{ className?: string }>> = {
  abierto: CircleDashed,
  en_progreso: Clock,
  pendiente: Pause,
  escalado: ArrowUpCircle,
  resuelto: CheckCircle2,
  cerrado: XCircle
}

const statusColors: Record<TicketStatus, string> = {
  abierto: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  en_progreso: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  pendiente: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  escalado: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  resuelto: 'bg-green-500/10 text-green-500 border-green-500/20',
  cerrado: 'bg-muted text-muted-foreground border-border'
}

const priorityColors: Record<TicketPriority, string> = {
  baja: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  media: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  alta: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  critica: 'bg-red-500/10 text-red-500 border-red-500/20'
}

const levelLabels: Record<string, string> = {
  tecnico_n1: 'N1',
  tecnico_n2: 'N2',
  tecnico_n3: 'N3'
}

export function TicketCard({ ticket }: TicketCardProps) {
  const StatusIcon = statusIcons[ticket.status] || CircleDashed
  const slaDate = new Date(ticket.slaDeadline)
  const isOverdue = new Date() > slaDate && !['resuelto', 'cerrado'].includes(ticket.status)

  return (
    <Link href={`/tickets/${ticket._id}`}>
      <Card className={cn(
        "transition-all hover:shadow-md hover:border-primary/50 cursor-pointer h-full overflow-hidden",
        isOverdue && "border-destructive/50"
      )}>
        <CardHeader className="pb-2 overflow-hidden">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-xs text-muted-foreground font-mono truncate">{ticket.ticketNumber}</p>
              <h3 className="font-semibold text-foreground line-clamp-2 mt-1">{ticket.title}</h3>
            </div>
            <Badge variant="outline" className={cn("shrink-0 whitespace-nowrap", priorityColors[ticket.priority])}>
              {PRIORITY_LABELS[ticket.priority]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge variant="outline" className={statusColors[ticket.status]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {STATUS_LABELS[ticket.status]}
            </Badge>
            <Badge variant="secondary">
              {CATEGORY_LABELS[ticket.category]}
            </Badge>
            {ticket.assignedLevel && (
              <Badge variant="outline">
                {levelLabels[ticket.assignedLevel] || ticket.assignedLevel}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="text-xs text-muted-foreground pt-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[120px]">{ticket.createdByName || ticket.createdByEmail}</span>
            </div>
            <div className="flex items-center gap-1">
              {isOverdue && <AlertCircle className="h-3 w-3 text-destructive" />}
              <Clock className="h-3 w-3" />
              <span>
                {new Date(ticket.createdAt).toLocaleDateString('es-CO', { 
                  day: '2-digit', 
                  month: 'short'
                })}
              </span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
