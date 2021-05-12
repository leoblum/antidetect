const baseResponseSchema = {
  type: 'object',
  required: ['success'],
  properties: {
    success: {type: 'boolean'},
    message: {type: 'string'},
  },
}

const baseAuthSchema = {
  type: 'object',
  required: ['email', 'password'],
  properties: {
    email: {type: 'string', format: 'email'},
    password: {type: 'string'},
  },
}

const registerSchema = {
  body: baseAuthSchema,
  response: {
    201: baseResponseSchema,
    412: baseResponseSchema,
  },
}

const authSchema = {
  body: baseAuthSchema,
  response: {
    200: {
      type: 'object',
      required: ['success', 'token'],
      properties: {
        success: {type: 'boolean'},
        token: {type: 'string'},
      },
    },
    401: baseResponseSchema,
  },
}

module.exports = {
  registerSchema,
  authSchema,
}
