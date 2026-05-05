import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Ticket, calculateSLADeadline, generateTicketNumber } from '@/lib/models/ticket'
import { cookies } from 'next/headers'
import { sendTicketCreated } from '@/lib/email'

// Determine initial support level based on priority and category
function resolveAssignedLevel(priority: string, category: string): string {
  if (priority === 'critica') return 'tecnico_n3'
  if (priority === 'alta' && (category === 'aplicacion' || category === 'red')) return 'tecnico_n2'
  return 'tecnico_n1'
}

async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) return null
  return JSON.parse(session.value)
}

// GET all tickets
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const priority = searchParams.get('priority')
    const assignedLevel = searchParams.get('assignedLevel')

    // Build query based on user role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {}

    // Clients can only see their own tickets
    if (user.role === 'cliente') {
      query.createdBy = user.id
    }
    // Technicians see tickets assigned to their level or below
    else if (user.role === 'tecnico_n1') {
      query.$or = [
        { assignedLevel: 'tecnico_n1' },
        { assignedTo: user.id }
      ]
    } else if (user.role === 'tecnico_n2') {
      query.$or = [
        { assignedLevel: { $in: ['tecnico_n1', 'tecnico_n2'] } },
        { assignedTo: user.id }
      ]
    } else if (user.role === 'tecnico_n3') {
      query.$or = [
        { assignedLevel: { $in: ['tecnico_n1', 'tecnico_n2', 'tecnico_n3'] } },
        { assignedTo: user.id }
      ]
    }
    // Admin sees all tickets

    // Apply filters
    if (status) query.status = status
    if (category) query.category = category
    if (priority) query.priority = priority
    if (assignedLevel && user.role !== 'cliente') query.assignedLevel = assignedLevel

    const tickets = await Ticket.find(query)
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ tickets })
  } catch (error) {
    console.error('Get tickets error:', error)
    return NextResponse.json({ error: 'Error al obtener tickets' }, { status: 500 })
  }
}

// POST create new ticket
export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { title, description, category, priority } = await request.json()

    if (!title || !description || !category || !priority) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const ticketNumber = await generateTicketNumber()
    const slaDeadline = calculateSLADeadline(priority)
    const assignedLevel = resolveAssignedLevel(priority, category)

    const ticket = new Ticket({
      ticketNumber,
      title,
      description,
      category,
      priority,
      status: 'abierto',
      createdBy: user.id,
      createdByName: user.displayName,
      createdByEmail: user.email,
      assignedLevel,
      slaDeadline,
    })

    await ticket.save()

    // Send confirmation email (non-blocking)
    sendTicketCreated({
      ticketNumber,
      title,
      category,
      priority,
      status: 'abierto',
      createdByName: user.displayName,
      createdByEmail: user.email,
    })

    return NextResponse.json({
      message: 'Ticket creado exitosamente',
      ticket,
    })
  } catch (error) {
    console.error('Create ticket error:', error)
    return NextResponse.json({ error: 'Error al crear ticket' }, { status: 500 })
  }
}
