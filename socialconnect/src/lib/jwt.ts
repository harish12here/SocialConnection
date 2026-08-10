import { SignJWT, jwtVerify, JWTPayload } from 'jose'
import { cookies } from 'next/headers'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default_secret_at_least_32_characters_long')

export async function createToken(payload: JWTPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret)
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch {
    return null
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  return payload as unknown as { id: string; email: string; username: string }
}
