import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/user'
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

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()
    const currentUser = await getSession()

    if (!currentUser) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    if (currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Solo administradores pueden crear usuarios' }, { status: 403 })
    }

    const { email, password, displayName, role, department, phone } = await request.json()

    if (!email || !password || !displayName) {
      return NextResponse.json({ error: 'Email, contraseña y nombre son requeridos' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 })
    }

    const newUser = await User.create({
      email: email.toLowerCase(),
      password,
      displayName,
      role: role || 'cliente',
      department,
      phone,
    })

    const userObj = newUser.toObject() as Record<string, unknown>
    delete userObj.password

    return NextResponse.json({ user: userObj }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 })
  }
}
