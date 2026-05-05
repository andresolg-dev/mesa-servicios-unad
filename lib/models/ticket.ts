import mongoose, { Schema, Document, Model } from 'mongoose'

export type TicketCategory = 'aplicacion' | 'conectividad' | 'equipo' | 'usuarios' | 'contrasenas'
export type TicketPriority = 'critica' | 'alta' | 'media' | 'baja'
export type TicketStatus = 'abierto' | 'en_progreso' | 'pendiente' | 'escalado' | 'resuelto' | 'cerrado'
export type TechnicianLevel = 'tecnico_n1' | 'tecnico_n2' | 'tecnico_n3'

export interface IComment {
  userId: mongoose.Types.ObjectId
  userName: string
  userRole: string
  content: string
  isInternal: boolean
  createdAt: Date
}

export interface IEscalation {
  fromLevel: TechnicianLevel
  toLevel: TechnicianLevel
  reason: string
  escalatedBy: mongoose.Types.ObjectId
  escalatedByName: string
  escalatedAt: Date
}

export interface ISatisfactionSurvey {
  rating: number
  comment?: string
  submittedAt: Date
}

export interface ITicket extends Document {
  _id: mongoose.Types.ObjectId
  ticketNumber: string
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  createdBy: mongoose.Types.ObjectId
  createdByName: string
  createdByEmail: string
  assignedTo?: mongoose.Types.ObjectId
  assignedToName?: string
  assignedLevel: TechnicianLevel
  comments: IComment[]
  escalationHistory: IEscalation[]
  satisfactionSurvey?: ISatisfactionSurvey
  slaDeadline: Date
  resolvedAt?: Date
  closedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  userRole: { type: String, required: true },
  content: { type: String, required: true },
  isInternal: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
})

const EscalationSchema = new Schema<IEscalation>({
  fromLevel: { type: String, enum: ['tecnico_n1', 'tecnico_n2', 'tecnico_n3'], required: true },
  toLevel: { type: String, enum: ['tecnico_n1', 'tecnico_n2', 'tecnico_n3'], required: true },
  reason: { type: String, required: true },
  escalatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  escalatedByName: { type: String, required: true },
  escalatedAt: { type: Date, default: Date.now },
})

const SatisfactionSurveySchema = new Schema<ISatisfactionSurvey>({
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  submittedAt: { type: Date, default: Date.now },
})

const TicketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['aplicacion', 'conectividad', 'equipo', 'usuarios', 'contrasenas'],
      required: true,
    },
    priority: {
      type: String,
      enum: ['critica', 'alta', 'media', 'baja'],
      required: true,
    },
    status: {
      type: String,
      enum: ['abierto', 'en_progreso', 'pendiente', 'escalado', 'resuelto', 'cerrado'],
      default: 'abierto',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdByName: {
      type: String,
      required: true,
    },
    createdByEmail: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    assignedToName: {
      type: String,
    },
    assignedLevel: {
      type: String,
      enum: ['tecnico_n1', 'tecnico_n2', 'tecnico_n3'],
      default: 'tecnico_n1',
    },
    comments: [CommentSchema],
    escalationHistory: [EscalationSchema],
    satisfactionSurvey: SatisfactionSurveySchema,
    slaDeadline: {
      type: Date,
      required: true,
    },
    resolvedAt: Date,
    closedAt: Date,
  },
  {
    timestamps: true,
  }
)

// SLA times in hours based on priority
export const SLA_TIMES: Record<TicketPriority, number> = {
  critica: 2,
  alta: 8,
  media: 24,
  baja: 48,
}

// Calculate SLA deadline
export function calculateSLADeadline(priority: TicketPriority): Date {
  const now = new Date()
  const hoursToAdd = SLA_TIMES[priority]
  return new Date(now.getTime() + hoursToAdd * 60 * 60 * 1000)
}

// Generate ticket number
export async function generateTicketNumber(): Promise<string> {
  const Counter = mongoose.models.Counter || mongoose.model('Counter', new Schema({
    _id: String,
    seq: { type: Number, default: 0 }
  }))
  
  const counter = await Counter.findByIdAndUpdate(
    'ticketNumber',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
  
  const year = new Date().getFullYear()
  return `TKT-${year}-${String(counter.seq).padStart(5, '0')}`
}

export const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>('Ticket', TicketSchema)
