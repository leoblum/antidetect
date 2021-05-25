const baseResponseSchema = {
  type: 'object',
  required: ['success'],
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
  },
}

const baseAuthSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string' },
  },
}

const UserCreateSchema = {
  body: baseAuthSchema,
  response: {
    201: baseResponseSchema,
    412: baseResponseSchema,
  },
}

const UserAuthSchema = {
  body: baseAuthSchema,
  response: {
    200: {
      type: 'object',
      required: ['success', 'token'],
      properties: {
        success: { type: 'boolean' },
        token: { type: 'string' },
      },
    },
    401: baseResponseSchema,
  },
}

const ProfileCreateSchema = {
  body: {
    type: 'object',
    required: ['name', 'fingerprint'],
    properties: {
      name: { type: 'string' },
      fingerprint: {
        type: 'object',
        // required: ['name', 'fingerprint'],
        properties: {
          os: { type: 'string' },
          userAgent: { type: 'string' },
          screen: { type: 'string' },
          renderer: { type: 'string' },
          cpu: { type: 'number' },
          ram: { type: 'number' },
        },
      },
    },
  },
}

module.exports = {
  UserCreateSchema,
  UserAuthSchema,
  ProfileCreateSchema,
}
