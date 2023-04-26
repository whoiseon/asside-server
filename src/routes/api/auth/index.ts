import Router from '@koa/router';
import { LoginParams, RegisterParams } from './types';
import {
  generateTokens,
  RefreshTokenPayload,
  resetTokenCookie,
  setTokenCookie,
  Tokens,
  validateToken,
} from 'src/lib/tokens';
import db from 'src/lib/database';
import bcrypt from 'bcrypt';

const auth = new Router();
const SALT_ROUNDS: number = 10;

auth.post('/login/local', async ctx => {
  const { email, password } = ctx.request.body as LoginParams;

  const user = await db.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      message: 'Invalid password or email',
      name: 'AuthenticationError',
    };
    return;
  }

  const { passwordHash, id, email: userEmail, username } = user;
  const isPasswordCorrect = await bcrypt.compare(password, passwordHash);

  if (!isPasswordCorrect) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      message: 'Invalid password or email',
      name: 'AuthenticationError',
    };
    return;
  }

  const tokens = await generateTokens(user);
  setTokenCookie(ctx, tokens);

  ctx.body = {
    user: {
      id,
      email: userEmail,
      username,
    },
    tokens,
  };
});

auth.post('/signup/local', async ctx => {
  const { username, email, password } = ctx.request.body as RegisterParams;
  const exists = await db.user.findFirst({
    where: {
      OR: [
        {
          email,
        },
        {
          username,
        },
      ],
    },
  });
  if (exists) {
    ctx.status = 409;
    ctx.body = {
      statusCode: 409,
      message: 'Username or email already exists',
      name: 'ExistsError',
      payload: email === exists.email ? 'email' : 'username',
    };
    return;
  }
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const createdUser = await db.user.create({
    data: {
      username,
      email,
      passwordHash,
    },
  });

  ctx.body = {
    registered: !!createdUser,
  };
});

auth.post('/refresh', async ctx => {
  const body = ctx.request.body as Tokens;
  const refreshToken = ctx.cookies.get('refresh_token') ?? body.refreshToken ?? '';
  if (!refreshToken) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      message: 'Failed to refresh token',
      name: 'RefreshTokenError',
    };
    return;
  }
  const { tokenId, rotationCounter } = await validateToken<RefreshTokenPayload>(refreshToken);
  const tokenItem = await db.token.findUnique({
    where: {
      id: tokenId,
    },
    include: {
      user: true,
    },
  });
  if (!tokenItem) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      message: 'Token not found',
      name: 'NotFoundTokenError',
    };
    return;
  }
  if (tokenItem.blocked) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      message: 'Token is blocked',
      name: 'BlockedTokenError',
    };
    return;
  }

  if (tokenItem.rotationCounter !== rotationCounter) {
    await db.token.update({
      where: {
        id: tokenId,
      },
      data: {
        blocked: true,
      },
    });
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      message: 'Token is blocked',
      name: 'BlockedTokenError',
    };
    return;
  }

  tokenItem.rotationCounter += 1;
  await db.token.update({
    where: {
      id: tokenItem.id,
    },
    data: {
      rotationCounter: tokenItem.rotationCounter,
    },
  });

  const tokens = await generateTokens(tokenItem.user, tokenItem);
  setTokenCookie(ctx, tokens);
  ctx.body = tokens;
});

auth.post('/logout', async ctx => {
  resetTokenCookie(ctx);
  ctx.status = 204;
});

export default auth;
