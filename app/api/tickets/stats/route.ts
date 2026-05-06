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

    // Build base query based on role
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseQuery: any = {}
    if (user.role === 'cliente') {
      baseQuery.createdBy = user.id
    }

    const now = new Date()

    // Get counts
    const [
      total,
      abiertos,
      enProgreso,
      pendientes,
      escalados,
      resueltos,
      cerrados,
      slaCumplido,
      slaVencido,
    ] = await Promise.all([
      Ticket.countDocuments(baseQuery),
      Ticket.countDocuments({ ...baseQuery, status: 'abierto' }),
      Ticket.countDocuments({ ...baseQuery, status: 'en_progreso' }),
      Ticket.countDocuments({ ...baseQuery, status: 'pendiente' }),
      Ticket.countDocuments({ ...baseQuery, status: 'escalado' }),
      Ticket.countDocuments({ ...baseQuery, status: 'resuelto' }),
      Ticket.countDocuments({ ...baseQuery, status: 'cerrado' }),
      Ticket.countDocuments({
        ...baseQuery,
        status: { $in: ['resuelto', 'cerrado'] },
        $expr: { $lte: ['$resolvedAt', '$slaDeadline'] },
      }),
      Ticket.countDocuments({
        ...baseQuery,
        $or: [
          { status: { $nin: ['resuelto', 'cerrado'] }, slaDeadline: { $lt: now } },
          { status: { $in: ['resuelto', 'cerrado'] }, $expr: { $gt: ['$resolvedAt', '$slaDeadline'] } },
        ],
      }),
    ])

    // Get category distribution
    const categoryStats = await Ticket.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ])

    // Get priority distribution
    const priorityStats = await Ticket.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
    ])

    // Get level distribution
    const levelStats = await Ticket.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$assignedLevel', count: { $sum: 1 } } },
    ])

    // Get satisfaction average
    const satisfactionStats = await Ticket.aggregate([
      { $match: { ...baseQuery, 'satisfactionSurvey.rating': { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$satisfactionSurvey.rating' }, count: { $sum: 1 } } },
    ])

    // Recent tickets for activity
    const recentTickets = await Ticket.find(baseQuery)
      .sort({ updatedAt: -1 })
      .limit(8)
      .select('ticketNumber title status priority updatedAt createdAt')
      .lean()

    // Daily ticket counts for the last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    const weeklyRaw = await Ticket.aggregate([
      { $match: { ...baseQuery, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dayOfWeek: '$createdAt' }, count: { $sum: 1 } } },
    ])
    const weeklyMap: Record<number, number> = {}
    weeklyRaw.forEach(({ _id, count }) => { weeklyMap[_id] = count })
    // Build a 7-element array starting from today going back
    const weeklyTrend = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000)
      const dow = d.getDay() + 1 // MongoDB $dayOfWeek: 1=Sun
      return { day: dayNames[d.getDay()], tickets: weeklyMap[dow] || 0 }
    })

    return NextResponse.json({
      stats: {
        total,
        abiertos,
        enProgreso,
        pendientes,
        escalados,
        resueltos,
        cerrados,
        slaCumplido,
        slaVencido,
        slaPercentage: total > 0 ? Math.round((slaCumplido / (slaCumplido + slaVencido || 1)) * 100) : 100,
        categoryDistribution: categoryStats.reduce((acc, { _id, count }) => {
          acc[_id] = count
          return acc
        }, {} as Record<string, number>),
        priorityDistribution: priorityStats.reduce((acc, { _id, count }) => {
          acc[_id] = count
          return acc
        }, {} as Record<string, number>),
        satisfactionAverage: satisfactionStats[0]?.avgRating || 0,
        satisfactionCount: satisfactionStats[0]?.count || 0,
        levelDistribution: levelStats.reduce((acc, { _id, count }) => {
          const num = _id === 'tecnico_n1' ? 1 : _id === 'tecnico_n2' ? 2 : _id === 'tecnico_n3' ? 3 : null
          if (num) acc[num] = count
          return acc
        }, {} as Record<number, number>),
        recentTickets,
        weeklyTrend,
      },
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Error al obtener estadísticas' }, { status: 500 })
  }
}
