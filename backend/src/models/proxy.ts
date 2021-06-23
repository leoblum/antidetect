import { Schema, model } from 'mongoose'

import { Proxy } from '@/types'

const schema = new Schema<Proxy>({
  name: String,
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  type: { type: String, enum: ['socks4', 'socks5', 'http', 'https', 'ssh'], required: true },
  host: { type: String, required: true },
  port: { type: Number, required: true },
  username: { type: String, default: null },
  password: { type: String, default: null },
  country: { type: String, default: null },
}, { timestamps: true })

export default model<Proxy>('Proxy', schema)
