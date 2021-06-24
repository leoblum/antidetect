import type { FromSchema } from 'json-schema-to-ts'

import { createModel } from './db'

export const UserSchema = {
  type: 'object',
  properties: {
    _id: { type: 'string' },
    teamId: { type: 'string' },
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
    emailConfirmed: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date' },
    updatedAt: { type: 'string', format: 'date' },
  },
  required: ['_id', 'teamId', 'email', 'password', 'emailConfirmed', 'createdAt', 'updatedAt'],
  additionalProperties: false,
} as const

export type User = FromSchema<typeof UserSchema>
export const users = createModel<User>('users')
