import mongoose, { Schema, Document, Model } from 'mongoose'
import bcrypt from 'bcryptjs'

export type UserRole = 'cliente' | 'tecnico_n1' | 'tecnico_n2' | 'tecnico_n3' | 'admin' | 'auditor'

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId
  email: string
  password: string
  displayName: string
  role: UserRole
  department?: string
  phone?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['cliente', 'tecnico_n1', 'tecnico_n2', 'tecnico_n3', 'admin', 'auditor'],
      default: 'cliente',
    },
    department: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Compare password method
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password)
}

// Prevent model recompilation error in development
export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
