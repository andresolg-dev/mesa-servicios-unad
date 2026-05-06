import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Ticket } from '@/lib/models/ticket'
import { cookies } from 'next/headers'
import { sendTicketAssigned, sendTicketEscalated, sendTicketResolved, sendCommentAdded, sendTicketEscalatedToTechs } from '@/lib/email'
import { User } from '@/lib/models/user'

async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) return null
  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
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
        if (user.role !== 'admin' && ticket.assignedLevel !== user.role) {
          return NextResponse.json({ error: 'Este ticket no corresponde a tu nivel' }, { status: 403 })
        }

        // Atomic: only assign if still unassigned (prevents race condition)
        const assigned = await Ticket.findOneAndUpdate(
          { _id: id, assignedTo: { $exists: false } },
          { $set: { assignedTo: user.id, assignedToName: user.displayName, status: 'en_progreso' } },
          { new: true }
        )

        if (!assigned) {
          return NextResponse.json({ error: 'El ticket ya fue tomado por otro técnico' }, { status: 409 })
        }

        sendTicketAssigned(
          {
            ticketNumber: assigned.ticketNumber,
            title: assigned.title,
            category: assigned.category,
            priority: assigned.priority,
            status: assigned.status,
            createdByName: assigned.createdByName,
            createdByEmail: assigned.createdByEmail,
            assignedToName: user.displayName,
          },
          user.email
        ).catch((err: unknown) => console.error('Email error (ticketAssigned):', err))

        return NextResponse.json({ message: 'Ticket tomado', ticket: assigned })
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

        const ticketInfo = {
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          category: ticket.category,
          priority: ticket.priority,
          status: 'escalado',
          createdByName: ticket.createdByName,
          createdByEmail: ticket.createdByEmail,
        }

        // Notify client
        sendTicketEscalated(ticketInfo, nextLevelLabel)
          .catch((err: unknown) => console.error('Email error (ticketEscalated):', err))

        // Notify all active technicians of the new level
        User.find({ role: nextLevel, isActive: true }).select('email').lean()
          .then((techs) => {
            const emails = techs.map((t) => t.email)
            if (emails.length > 0) {
              return sendTicketEscalatedToTechs(ticketInfo, nextLevelLabel, emails)
            }
          })
          .catch((err: unknown) => console.error('Email error (ticketEscalatedToTechs):', err))
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

        sendTicketResolved({
          ticketNumber: ticket.ticketNumber,
          title: ticket.title,
          category: ticket.category,
          priority: ticket.priority,
          status: 'resuelto',
          createdByName: ticket.createdByName,
          createdByEmail: ticket.createdByEmail,
          assignedToName: ticket.assignedToName,
        }).catch((err: unknown) => console.error('Email error (ticketResolved):', err))
        break
      }

      case 'close':
        ticket.status = 'cerrado'
        ticket.closedAt = new Date()
        break

      case 'comment': {
        const isInternal = data.isInternal || false
        ticket.comments.push({
          userId: user.id,
          userName: user.displayName,
          userRole: user.role,
          content: data.content,
          isInternal,
          createdAt: new Date(),
        })

        // Notify the other party (skip internal notes)
        if (!isInternal) {
          const commentInfo = { authorName: user.displayName, content: data.content }
          const ticketRef = {
            ticketNumber: ticket.ticketNumber, title: ticket.title,
            category: ticket.category, priority: ticket.priority, status: ticket.status,
            createdByName: ticket.createdByName, createdByEmail: ticket.createdByEmail,
          }
          if (user.role === 'cliente' && ticket.assignedToName) {
            // Client commented → notify assigned tech
            User.findById(ticket.assignedTo).select('email').lean()
              .then((tech) => {
                if (tech?.email) {
                  return sendCommentAdded(ticketRef, commentInfo, tech.email, ticket.assignedToName!)
                }
              })
              .catch((err: unknown) => console.error('Email error (comment→tech):', err))
          } else if (user.role !== 'cliente') {
            // Tech commented → notify client
            sendCommentAdded(ticketRef, commentInfo, ticket.createdByEmail, ticket.createdByName)
              .catch((err: unknown) => console.error('Email error (comment→client):', err))
          }
        }
        break
      }

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
