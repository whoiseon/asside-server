import jwt from 'jsonwebtoken';

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

type TokenPayload = AccessTokenPayload | RefreshTokenPayload;

type DecodedToken<T> = {
  iat: number;
  exp: number;
} & T;
