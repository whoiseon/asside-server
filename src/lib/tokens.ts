import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';
import { Context } from 'koa';

const JWT_TOKEN_SECRET = process.env.JWT_TOKEN_SECRET ?? 'DevSecretKey';

const tokenDuration = {
  access_token: '1h', // 1 hour
  refresh_token: '7d', // 1 week
} as const;

if (process.env.JWT_TOKEN_SECRET === undefined) {
  console.warn('JWT_TOKEN_SECRET is not defined in .env file');
}

export function generateToken(payload: TokenPayload) {
  return new Promise<string>((resolve, reject) => {
    const { type } = payload;
    jwt.sign(
      payload,
      JWT_TOKEN_SECRET,
      {
        expiresIn: tokenDuration[type],
      },
      (err, token) => {
        if (err || !token) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });
}

export async function generateTokens(user: User) {
  const { id: userId, email, username } = user;
  const [accessToken, refreshToken] = await Promise.all([
    generateToken({
      type: 'access_token',
      userId,
      tokenId: 1,
      email,
      username,
    }),
    generateToken({
      type: 'refresh_token',
      tokenId: 1,
      rotationCounter: 0,
    }),
  ]);

  return {
    accessToken,
    refreshToken,
  };
}

export function validateToken<T>(token: string) {
  return new Promise<DecodedToken<T>>((resolve, reject) => {
    jwt.verify(token, JWT_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        reject(err);
      }
      resolve(decoded as DecodedToken<T>);
    });
  });
}

export function setTokenCookie(ctx: Context, tokens: Tokens) {
  const { accessToken, refreshToken } = tokens;
  ctx.cookies.set('access_token', accessToken, {
    maxAge: 1000 * 60 * 60,
    path: '/',
  });
  ctx.cookies.set('refresh_token', refreshToken, {
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: '/',
  });
}

export function resetTokenCookie(ctx: Context) {
  ctx.cookies.set('access_token', '', {
    maxAge: 0,
    path: '/',
  });
  ctx.cookies.set('refresh_token', '', {
    maxAge: 0,
    path: '/',
  });
}

interface AccessTokenPayload {
  type: 'access_token';
  userId: number;
  tokenId: number;
  username: string;
  email: string;
}

export interface RefreshTokenPayload {
  type: 'refresh_token';
  tokenId: number;
  rotationCounter: number;
}

export type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type TokenPayload = AccessTokenPayload | RefreshTokenPayload;

type DecodedToken<T> = {
  iat: number;
  exp: number;
} & T;
