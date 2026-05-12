import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { Ticket } from '@/lib/models/ticket'
import { cookies } from 'next/headers'

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

export async function GET() {
  try {
    await connectToDatabase()
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (user.role === 'cliente') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const tickets = await Ticket.find({ 'satisfactionSurvey.rating': { $exists: true } })
      .select('ticketNumber title category priority createdByName createdByEmail satisfactionSurvey closedAt')
      .sort({ 'satisfactionSurvey.submittedAt': -1 })
      .lean()

    return NextResponse.json({ surveys: tickets })
  } catch (error) {
    console.error('Surveys error:', error)
    return NextResponse.json({ error: 'Error al obtener encuestas' }, { status: 500 })
  }
}
