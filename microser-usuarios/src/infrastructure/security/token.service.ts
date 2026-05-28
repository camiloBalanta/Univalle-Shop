import { Injectable } from '@nestjs/common';
import { createHmac } from 'crypto';

export interface TokenPayload {
  userId: string;
  codigo: string;
  anioRegistro: number;
  rol: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class TokenService {
  private readonly secret: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'univalle-shop-secret';
  }

  generateToken(payload: TokenPayload, expiresInSeconds = 3600): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const data = {
      ...payload,
      iat: now,
      exp: now + expiresInSeconds,
    };

    const encodedHeader = this.encode(JSON.stringify(header));
    const encodedPayload = this.encode(JSON.stringify(data));
    const signature = this.sign(`${encodedHeader}.${encodedPayload}`);

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  verifyToken(token: string): TokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const payloadRaw = `${encodedHeader}.${encodedPayload}`;
    const expectedSignature = this.sign(payloadRaw);

    if (!this.timingSafeEqual(signature, expectedSignature)) {
      throw new Error('Invalid token signature');
    }

    const payloadJson = Buffer.from(encodedPayload, 'base64url').toString('utf8');
    const payload = JSON.parse(payloadJson) as TokenPayload;

    if (!payload.exp || Math.floor(Date.now() / 1000) >= payload.exp) {
      throw new Error('Token expired');
    }

    return payload;
  }

  private encode(value: string): string {
    return Buffer.from(value, 'utf8').toString('base64url');
  }

  private sign(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('base64url');
  }

  private timingSafeEqual(a: string, b: string): boolean {
    const bufferA = Buffer.from(a, 'utf8');
    const bufferB = Buffer.from(b, 'utf8');

    if (bufferA.length !== bufferB.length) {
      return false;
    }

    return bufferA.equals(bufferB);
  }
}
