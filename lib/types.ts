export type UserRole = 'cliente' | 'tecnico_n1' | 'tecnico_n2' | 'tecnico_n3' | 'admin'

export type TicketStatus = 'abierto' | 'en_progreso' | 'pendiente' | 'escalado' | 'resuelto' | 'cerrado'

export type TicketPriority = 'baja' | 'media' | 'alta' | 'critica'

export type TicketCategory = 
  | 'aplicacion' 
  | 'conectividad' 
  | 'equipo' 
  | 'usuarios' 
  | 'contrasenas'

export interface User {
  uid: string
  email: string
  displayName: string
  role: UserRole
  department?: string
  createdAt: Date
  isActive: boolean
}

export interface Ticket {
  id: string
  ticketNumber: string
  title: string
  description: string
  category: TicketCategory
  status: TicketStatus
  priority: TicketPriority
  createdBy: string
  createdByEmail: string
  assignedTo?: string
  assignedToEmail?: string
  assignedLevel?: 'tecnico_n1' | 'tecnico_n2' | 'tecnico_n3'
  createdAt: Date
  updatedAt: Date
  resolvedAt?: Date
  closedAt?: Date
  slaDeadline: Date
  responseTime?: number
  resolutionTime?: number
  escalationHistory: EscalationRecord[]
  comments: Comment[]
  satisfactionRating?: number
  satisfactionComment?: string
}

export interface EscalationRecord {
  fromLevel: number
  toLevel: number
  reason: string
  escalatedBy: string
  escalatedAt: Date
}

export interface Comment {
  id: string
  content: string
  authorId: string
  authorEmail: string
  authorRole: UserRole
  createdAt: Date
  isInternal: boolean
}

export interface SLA {
  id: string
  priority: TicketPriority
  responseTimeMinutes: number
  resolutionTimeMinutes: number
  description: string
}

export interface KPIMetrics {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  closedTickets: number
  averageResponseTime: number
  averageResolutionTime: number
  firstContactResolutionRate: number
  slaComplianceRate: number
  customerSatisfactionScore: number
  ticketsByCategory: Record<TicketCategory, number>
  ticketsByPriority: Record<TicketPriority, number>
  ticketsByLevel: Record<number, number>
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  aplicacion: 'Aplicación',
  conectividad: 'Conectividad',
  equipo: 'Equipo',
  usuarios: 'Usuarios',
  contrasenas: 'Contraseñas'
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
  abierto: 'Abierto',
  en_progreso: 'En Progreso',
  pendiente: 'Pendiente',
  escalado: 'Escalado',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado'
}

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  critica: 'Crítica'
}

export const ROLE_LABELS: Record<UserRole, string> = {
  cliente: 'Cliente',
  tecnico_n1: 'Técnico Nivel 1',
  tecnico_n2: 'Técnico Nivel 2',
  tecnico_n3: 'Técnico Nivel 3',
  admin: 'Administrador'
}

export const DEFAULT_SLAS: SLA[] = [
  { id: '1', priority: 'baja', responseTimeMinutes: 480, resolutionTimeMinutes: 2880, description: 'Respuesta en 8 horas, resolución en 48 horas' },
  { id: '2', priority: 'media', responseTimeMinutes: 240, resolutionTimeMinutes: 1440, description: 'Respuesta en 4 horas, resolución en 24 horas' },
  { id: '3', priority: 'alta', responseTimeMinutes: 60, resolutionTimeMinutes: 480, description: 'Respuesta en 1 hora, resolución en 8 horas' },
  { id: '4', priority: 'critica', responseTimeMinutes: 15, resolutionTimeMinutes: 120, description: 'Respuesta en 15 minutos, resolución en 2 horas' },
]
