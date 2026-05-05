import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/user'
import { cookies } from 'next/headers'

async function getSession() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) return null
  return JSON.parse(session.value)
}

export async function GET() {
  try {
    await connectToDatabase()
    const user = await getSession()

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Only admin and technicians can view user list
    if (user.role === 'cliente') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}
