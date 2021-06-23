import { Schema, model } from 'mongoose'

type User = {
  team: string
  email: string
  password: string
  emailConfirmed: boolean,
}

const schema = new Schema<User>({
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  emailConfirmed: { type: Boolean, required: true, default: false },
}, { timestamps: true })

export default model<User>('User', schema)
