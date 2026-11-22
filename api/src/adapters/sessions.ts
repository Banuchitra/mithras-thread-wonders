// Our own session tokens: HS256 JWTs signed with SESSION_SECRET (ADR-005).
import { SignJWT, jwtVerify } from 'jose';

const ISSUER = 'mithras-api';
const key = (secret: string) => new TextEncoder().encode(secret);

export async function signSession(email: string, tokenVersion: number, secret: string, ttl = '7d'): Promise<string> {
  return new SignJWT({ v: tokenVersion }).setProtectedHeader({ alg: 'HS256' }).setSubject(email)
    .setIssuer(ISSUER).setIssuedAt().setExpirationTime(ttl).sign(key(secret));
}

export async function verifySession(token: string, secret: string): Promise<{ email: string; tokenVersion: number }> {
  const { payload } = await jwtVerify(token, key(secret), { issuer: ISSUER, algorithms: ['HS256'] });
  if (!payload.sub || typeof payload.v !== 'number') throw new Error('Malformed session');
  return { email: payload.sub, tokenVersion: payload.v };
}
