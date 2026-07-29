import crypto from 'crypto'

const SECRET = process.env.SESSION_SECRET || ''

function sign(payload: string): string {
  return crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')
}

/**
 * Creates a tamper-proof session token: base64url(payload) + '.' + HMAC signature.
 * The payload itself is NOT encrypted (don't put secrets in it), only signed,
 * so it can't be modified without invalidating the signature.
 */
export function createSessionToken(data: object): string {
  if (!SECRET) {
    throw new Error('SESSION_SECRET is not set - refusing to issue an unsigned session')
  }
  const payload = Buffer.from(JSON.stringify(data)).toString('base64url')
  const signature = sign(payload)
  return `${payload}.${signature}`
}

/**
 * Verifies a session token's signature and returns the decoded payload,
 * or null if the token is missing, malformed, or has been tampered with.
 */
export function verifySessionToken<T = any>(token: string | undefined | null): T | null {
  if (!token || !SECRET) return null

  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payload, signature] = parts
  if (!payload || !signature) return null

  const expected = sign(payload)
  const sigBuf = Buffer.from(signature)
  const expBuf = Buffer.from(expected)

  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null
  }

  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as T
  } catch {
    return null
  }
}
