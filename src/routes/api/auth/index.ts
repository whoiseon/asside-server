import Router from '@koa/router';
import { LoginParams, RegisterParams } from './types';
import { generateTokens, Tokens } from 'src/lib/tokens';
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

  ctx.body = {
    user: {
      id,
      email: userEmail,
      username,
    },
    tokens,
  };
});

auth.post('/register/local', async ctx => {
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
      name: 'UsernameAlreadyExists',
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

export default auth;
