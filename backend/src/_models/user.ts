import { Schema, model } from 'mongoose'

import type { User } from '@/types'

const schema = new Schema<User>({
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  emailConfirmed: { type: Boolean, required: true, default: false },
}, { timestamps: true })

export const UserModel = model<User>('User', schema)

// async function func () {
// let u1 = await UserModel.findById()
// u1.
// }
