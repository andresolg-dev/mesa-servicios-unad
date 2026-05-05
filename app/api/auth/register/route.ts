import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { User, UserRole } from '@/lib/models/user'

// Predefined users with their roles
const PREDEFINED_ROLES: Record<string, UserRole> = {
  'guzmanpalaciosmichelcamila@gmail.com': 'cliente',
  'pcpaulacorredor1@gmail.com': 'tecnico_n1',
  'jufefiguti123@gmail.com': 'tecnico_n2',
  'andypadilla1810@gmail.com': 'tecnico_n3',
  'andresolgin.rodriguez@gmail.com': 'admin',
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase()

    const { email, password, displayName, department, phone } = await request.json()

    if (!email || !password || !displayName) {
      return NextResponse.json(
        { error: 'Email, contraseña y nombre son requeridos' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      )
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      )
    }

    // Assign role based on predefined list or default to cliente
    const role = PREDEFINED_ROLES[email.toLowerCase()] || 'cliente'

    const user = new User({
      email: email.toLowerCase(),
      password,
      displayName,
      role,
      department,
      phone,
    })

    await user.save()

    return NextResponse.json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user._id.toString(),
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
