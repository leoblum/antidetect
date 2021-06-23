import { Schema, model } from 'mongoose'

type LinkToken = {
  user: string
  action: 'create' | 'reset'
}

const schema = new Schema<LinkToken>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['create', 'reset'], required: true },
}, { timestamps: true })

export default model<LinkToken>('LinkToken', schema)
