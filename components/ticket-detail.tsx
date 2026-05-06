'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpCircle,
  MessageSquare,
  Send,
  Loader2,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CATEGORY_LABELS, STATUS_LABELS, PRIORITY_LABELS, ROLE_LABELS, TYPE_LABELS } from '@/lib/types'
import type { TicketStatus, TicketPriority, TicketCategory, TicketType, UserRole } from '@/lib/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface TicketData {
  _id: string
  ticketNumber: string
  title: string
  description: string
  category: TicketCategory
  ticketType: TicketType
  priority: TicketPriority
  status: TicketStatus
  createdBy: string
  createdByName: string
  createdByEmail: string
  assignedTo?: string
  assignedToName?: string
  assignedLevel: string
  comments: Array<{
    userId: string
    userName: string
    userRole: UserRole
    content: string
    isInternal: boolean
    createdAt: string
  }>
  escalationHistory: Array<{
    fromLevel: string
    toLevel: string
    reason: string
    escalatedByName: string
    escalatedAt: string
  }>
  satisfactionSurvey?: {
    rating: number
    comment?: string
  }
  slaDeadline: string
  resolvedAt?: string
  createdAt: string
}

interface TicketDetailProps {
  ticket: TicketData
  onUpdate: () => void
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
  tecnico_n1: 'Nivel 1',
  tecnico_n2: 'Nivel 2',
  tecnico_n3: 'Nivel 3'
}

export function TicketDetail({ ticket, onUpdate }: TicketDetailProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [assignError, setAssignError] = useState('')
  const [comment, setComment] = useState('')
  const [escalationReason, setEscalationReason] = useState('')
  const [showEscalateDialog, setShowEscalateDialog] = useState(false)
  const [showSurveyDialog, setShowSurveyDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [surveyComment, setSurveyComment] = useState('')

  const isTechnician = user?.role?.startsWith('tecnico') || user?.role === 'admin'
  const isAdmin = user?.role === 'admin'
  const isOwner = user?.id === ticket.createdBy
  // Technician can take the ticket if it's at their level and unassigned
  const levelMatch = isAdmin || ticket.assignedLevel === user?.role
  const canTakeTicket =
    isTechnician &&
    !ticket.assignedTo &&
    (ticket.status === 'abierto' || ticket.status === 'escalado') &&
    levelMatch
  const canResolve = isTechnician && ticket.assignedTo === user?.id && ticket.status !== 'resuelto'
  const canEscalate =
    isTechnician &&
    ticket.assignedTo === user?.id &&
    ticket.assignedLevel !== 'tecnico_n3' &&
    !['resuelto', 'cerrado'].includes(ticket.status)
  // Close + survey are unified: closing always triggers the survey dialog
  const canClose = isOwner && ticket.status === 'resuelto'
  const canSurvey = isOwner && ticket.status === 'cerrado' && !ticket.satisfactionSurvey

  const slaDate = new Date(ticket.slaDeadline)
  const isOverdue = new Date() > slaDate && !['resuelto', 'cerrado'].includes(ticket.status)

  const updateTicket = async (action: string, data: Record<string, unknown> = {}) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/tickets/${ticket._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })
      if (res.ok) {
        onUpdate()
      }
      return res
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleTakeTicket = async () => {
    setAssignError('')
    const res = await updateTicket('assign')
    if (res?.status === 409) {
      setAssignError('Este ticket ya fue tomado por otro técnico.')
      onUpdate()
    }
  }
  const handleResolve = () => updateTicket('resolve', { comment: 'Ticket resuelto' })

  const handleEscalate = async () => {
    await updateTicket('escalate', { reason: escalationReason })
    setShowEscalateDialog(false)
    setEscalationReason('')
  }

  const handleAddComment = async () => {
    if (!comment.trim()) return
    await updateTicket('comment', { content: comment, isInternal: false })
    setComment('')
  }

  const handleSubmitSurvey = async () => {
    if (rating === 0) return
    await updateTicket('survey', { rating, comment: surveyComment })
    setShowSurveyDialog(false)
    setRating(0)
    setSurveyComment('')
  }

  const ratingLabels: Record<number, string> = {
    1: 'Muy insatisfecho',
    2: 'Insatisfecho',
    3: 'Neutral',
    4: 'Satisfecho',
    5: 'Muy satisfecho',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground font-mono">{ticket.ticketNumber}</p>
              <CardTitle className="text-2xl mt-1">{ticket.title}</CardTitle>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={cn(statusColors[ticket.status], "text-sm")}>
                {STATUS_LABELS[ticket.status]}
              </Badge>
              <Badge variant="outline" className={cn(priorityColors[ticket.priority], "text-sm")}>
                {PRIORITY_LABELS[ticket.priority]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground whitespace-pre-wrap">{ticket.description}</p>
          
          <Separator className="my-4" />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Tipo de Ticket</p>
              {isTechnician ? (
                <Select
                  value={ticket.ticketType || 'incidente'}
                  onValueChange={(value) => updateTicket('updateType', { ticketType: value })}
                  disabled={loading}
                >
                  <SelectTrigger className="h-7 text-sm w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="font-medium">{TYPE_LABELS[ticket.ticketType] || 'Incidente'}</p>
              )}
            </div>
            <div>
              <p className="text-muted-foreground">Categoría</p>
              <p className="font-medium">{CATEGORY_LABELS[ticket.category]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Nivel de Soporte</p>
              <p className="font-medium">{levelLabels[ticket.assignedLevel]}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Creado por</p>
              <p className="font-medium">{ticket.createdByName}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Asignado a</p>
              <p className="font-medium">{ticket.assignedToName || 'Sin asignar'}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid gap-4 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Creado
              </p>
              <p className="font-medium">
                {new Date(ticket.createdAt).toLocaleString('es-CO')}
              </p>
            </div>
            <div>
              <p className={cn(
                "text-muted-foreground flex items-center gap-1",
                isOverdue && "text-destructive"
              )}>
                {isOverdue && <AlertCircle className="h-3 w-3" />}
                SLA Limite
              </p>
              <p className={cn("font-medium", isOverdue && "text-destructive")}>
                {slaDate.toLocaleString('es-CO')}
              </p>
            </div>
            {ticket.resolvedAt && (
              <div>
                <p className="text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Resuelto
                </p>
                <p className="font-medium">
                  {new Date(ticket.resolvedAt).toLocaleString('es-CO')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      {(canTakeTicket || canResolve || canEscalate || canClose || canSurvey) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Acciones</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2 items-center">
            {canTakeTicket && (
              <Button onClick={handleTakeTicket} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
                Tomar Ticket
              </Button>
            )}
            {assignError && (
              <p className="text-sm text-destructive">{assignError}</p>
            )}
            {canResolve && (
              <Button onClick={handleResolve} disabled={loading} variant="default">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Marcar como Resuelto
              </Button>
            )}
            {canEscalate && (
              <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <ArrowUpCircle className="mr-2 h-4 w-4" />
                    Escalar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Escalar Ticket</DialogTitle>
                    <DialogDescription>
                      El ticket será escalado al siguiente nivel de soporte
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Textarea
                      placeholder="Motivo del escalamiento..."
                      value={escalationReason}
                      onChange={(e) => setEscalationReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>Cancelar</Button>
                    <Button onClick={handleEscalate} disabled={loading || !escalationReason.trim()}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Confirmar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
            {/* Closing always triggers the satisfaction survey */}
            {(canClose || canSurvey) && (
              <Dialog open={showSurveyDialog} onOpenChange={setShowSurveyDialog}>
                <DialogTrigger asChild>
                  <Button variant="default">
                    <Star className="mr-2 h-4 w-4" />
                    {canClose ? 'Cerrar y evaluar servicio' : 'Evaluar servicio'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                      Evaluación de servicio
                    </DialogTitle>
                    <DialogDescription>
                      Tu opinión nos ayuda a mejorar. ¿Cómo calificarías la atención recibida?
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6 py-2">
                    {/* Stars */}
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <button
                            key={value}
                            onClick={() => setRating(value)}
                            onMouseEnter={() => setHoverRating(value)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              className={cn(
                                'h-10 w-10 transition-colors',
                                value <= (hoverRating || rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-muted-foreground/40'
                              )}
                            />
                          </button>
                        ))}
                      </div>
                      <p className={cn(
                        'text-sm font-medium transition-all min-h-[20px]',
                        (hoverRating || rating) > 0 ? 'text-foreground' : 'text-transparent'
                      )}>
                        {ratingLabels[hoverRating || rating] || ''}
                      </p>
                    </div>

                    {/* Comment */}
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium">
                        Comentario <span className="text-muted-foreground font-normal">(opcional)</span>
                      </label>
                      <Textarea
                        placeholder="Cuéntanos cómo fue tu experiencia..."
                        value={surveyComment}
                        onChange={(e) => setSurveyComment(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSurveyDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmitSurvey} disabled={loading || rating === 0}>
                      {loading
                        ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
                        : <><CheckCircle2 className="h-4 w-4" /> Enviar y cerrar ticket</>
                      }
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      )}

      {/* Satisfaction Rating */}
      {ticket.satisfactionSurvey && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              Calificacion del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star 
                  key={value}
                  className={cn(
                    "h-5 w-5",
                    value <= ticket.satisfactionSurvey!.rating 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-muted-foreground"
                  )} 
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">
                {ticket.satisfactionSurvey.rating}/5
              </span>
            </div>
            {ticket.satisfactionSurvey.comment && (
              <p className="text-sm text-muted-foreground">{ticket.satisfactionSurvey.comment}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Escalation History */}
      {ticket.escalationHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ArrowUpCircle className="h-5 w-5" />
              Historial de Escalamientos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ticket.escalationHistory.map((record, index) => (
                <div key={index} className="flex items-start gap-3 text-sm">
                  <div className="h-2 w-2 rounded-full bg-orange-500 mt-2" />
                  <div>
                    <p className="font-medium">
                      {levelLabels[record.fromLevel]} → {levelLabels[record.toLevel]}
                    </p>
                    <p className="text-muted-foreground">{record.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Por {record.escalatedByName} - {new Date(record.escalatedAt).toLocaleString('es-CO')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comentarios ({ticket.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticket.comments.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No hay comentarios aun
            </p>
          ) : (
            <div className="space-y-4">
              {ticket.comments.map((c, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "p-3 rounded-lg",
                    c.isInternal ? "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800" : "bg-muted"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{c.userName}</span>
                      <Badge variant="outline" className="text-xs">
                        {ROLE_LABELS[c.userRole]}
                      </Badge>
                      {c.isInternal && (
                        <Badge variant="secondary" className="text-xs">Interno</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(c.createdAt).toLocaleString('es-CO')}
                    </span>
                  </div>
                  <p className="text-sm">{c.content}</p>
                </div>
              ))}
            </div>
          )}

          {ticket.status !== 'cerrado' && (
            <>
              <Separator />
              <div className="space-y-2">
                <Textarea
                  placeholder="Escriba un comentario..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleAddComment} 
                    disabled={loading || !comment.trim()}
                    size="sm"
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    Enviar
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
