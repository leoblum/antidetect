import { Schema, model } from 'mongoose'

type LinkToken = {
  user: string
  action: 'create' | 'reset'
}

const schema = new Schema<LinkToken>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['create', 'reset'], required: true },
}, { timestamps: true })

const LinkToken = model<LinkToken>('LinkToken', schema)
export { LinkToken }
