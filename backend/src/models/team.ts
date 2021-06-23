import { Schema, model } from 'mongoose'

type Team = {
  name: string
}

const schema = new Schema<Team>({
  name: { type: String, required: true },
}, { timestamps: true })

export default model<Team>('Team', schema)
