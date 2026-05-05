import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { User } from '@/lib/models/user'

const defaultUsers = [
  {
    email: 'guzmanpalaciosmichelcamila@gmail.com',
    displayName: 'Michel Camila Guzmán',
    role: 'cliente',
    department: 'Externo',
    password: 'Cliente123!'
  },
  {
    email: 'saladeinformaticacoam@gmail.com',
    displayName: 'Sala de Informática',
    role: 'cliente',
    department: 'Externo',
    password: 'Cliente123!'
  },
  {
    email: 'pcpaulacorredor1@gmail.com',
    displayName: 'Paula Corredor',
    role: 'tecnico_n1',
    department: 'Soporte TI',
    password: 'Tecnico1!'
  },
  {
    email: 'jufefiguti123@gmail.com',
    displayName: 'Juan Felipe Gutiérrez',
    role: 'tecnico_n2',
    department: 'Soporte TI',
    password: 'Tecnico2!'
  },
  {
    email: 'andypadilla1810@gmail.com',
    displayName: 'Andy Padilla',
    role: 'tecnico_n3',
    department: 'Infraestructura',
    password: 'Tecnico3!'
  },
  {
    email: 'andresolgin.rodriguez@gmail.com',
    displayName: 'Andrés Olgin Rodríguez',
    role: 'admin',
    department: 'Dirección TI',
    password: 'Admin123!'
  }
]

export async function POST() {
  try {
    await connectToDatabase()

    const results = []

    for (const userData of defaultUsers) {
      const existingUser = await User.findOne({ email: userData.email })

      if (existingUser) {
        results.push({ email: userData.email, status: 'already exists' })
        continue
      }

      // Use new + save so the pre-save hook hashes the password once
      const user = new User(userData)
      await user.save()

      results.push({ email: user.email, status: 'created', role: user.role })
    }

    return NextResponse.json({
      success: true,
      message: 'Seed completado',
      results
    })
  } catch (error) {
    console.error('Error en seed:', error)
    return NextResponse.json(
      { error: 'Error al ejecutar seed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST para ejecutar el seed de usuarios',
    users: defaultUsers.map(u => ({ email: u.email, role: u.role, displayName: u.displayName }))
  })
}
