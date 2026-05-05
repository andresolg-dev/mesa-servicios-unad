import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Ticket } from '@/lib/models/ticket'
import { cookies } from 'next/headers'
import { sendTicketAssigned, sendTicketEscalated, sendTicketResolved } from '@/lib/email'

async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) return null
  return JSON.parse(session.value)
}

// GET single ticket
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const user = await getSession()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const ticket = await Ticket.findById(id).lean()

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
    }

    // Check access
    if (user.role === 'cliente' && ticket.createdBy.toString() !== user.id) {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Get ticket error:', error)
    return NextResponse.json({ error: 'Error al obtener ticket' }, { status: 500 })
  }
}

// PATCH update ticket
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDatabase()
    const user = await getSession()
    const { id } = await params

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const ticket = await Ticket.findById(id)

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
    }

    // Handle different actions
    const { action, ...data } = body

    switch (action) {
      case 'assign': {
        if (user.role === 'cliente') {
          return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }
        ticket.assignedTo = user.id
        ticket.assignedToName = user.displayName
        ticket.status = 'en_progreso'

        // Notify technician (non-blocking)
        sendTicketAssigned(
          {
            ticketNumber: ticket.ticketNumber,
            title: ticket.title,
            category: ticket.category,
            priority: ticket.priority,
            status: ticket.status,
            createdByName: ticket.createdByName,
            createdByEmail: ticket.createdByEmail,
            assignedToName: user.displayName,
          },
          user.email
        )
        break
      }

      case 'escalate': {
        if (user.role === 'cliente') {
          return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }
        const currentLevel = ticket.assignedLevel
        const nextLevel = currentLevel === 'tecnico_n1' ? 'tecnico_n2' : 'tecnico_n3'
        const nextLevelLabel = nextLevel === 'tecnico_n2' ? 'Técnico Nivel 2' : 'Técnico Nivel 3'

        ticket.escalationHistory.push({
          fromLevel: currentLevel,
          toLevel: nextLevel,
          reason: data.reason || 'Escalado por complejidad',
          escalatedBy: user.id,
          escalatedByName: user.displayName,
          escalatedAt: new Date(),
        })
        ticket.assignedLevel = nextLevel
        ticket.assignedTo = undefined
        ticket.assignedToName = undefined
        ticket.status = 'escalado'

        // Notify requester (non-blocking)
        sendTicketEscalated(
          {
            ticketNumber: ticket.ticketNumber,
            title: ticket.title,
            category: ticket.category,
            priority: ticket.priority,
            status: 'escalado',
            createdByName: ticket.createdByName,
            createdByEmail: ticket.createdByEmail,
          },
          nextLevelLabel
        )
        break
      }

      case 'resolve': {
        if (user.role === 'cliente') {
          return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }
        ticket.status = 'resuelto'
        ticket.resolvedAt = new Date()
        if (data.comment) {
          ticket.comments.push({
            userId: user.id,
            userName: user.displayName,
            userRole: user.role,
            content: data.comment,
            isInternal: false,
            createdAt: new Date(),
          })
        }

        // Notify requester (non-blocking)
        sendTicketResolved({
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          category: ticket.category,
          priority: ticket.priority,
          status: 'resuelto',
          createdByName: ticket.createdByName,
          createdByEmail: ticket.createdByEmail,
          assignedToName: ticket.assignedToName,
        })
        break
      }

      case 'close':
        ticket.status = 'cerrado'
        ticket.closedAt = new Date()
        break

      case 'comment':
        ticket.comments.push({
          userId: user.id,
          userName: user.displayName,
          userRole: user.role,
          content: data.content,
          isInternal: data.isInternal || false,
          createdAt: new Date(),
        })
        break

      case 'survey':
        if (user.role !== 'cliente') {
          return NextResponse.json({ error: 'Solo clientes pueden evaluar' }, { status: 403 })
        }
        ticket.satisfactionSurvey = {
          rating: data.rating,
          comment: data.comment,
          submittedAt: new Date(),
        }
        ticket.status = 'cerrado'
        ticket.closedAt = new Date()
        break

      case 'updateStatus':
        if (user.role === 'cliente') {
          return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
        }
        ticket.status = data.status
        break

      default:
        // Direct field updates (for admin)
        if (user.role === 'admin') {
          Object.assign(ticket, data)
        }
    }

    await ticket.save()

    return NextResponse.json({
      message: 'Ticket actualizado',
      ticket,
    })
  } catch (error) {
    console.error('Update ticket error:', error)
    return NextResponse.json({ error: 'Error al actualizar ticket' }, { status: 500 })
  }
}
