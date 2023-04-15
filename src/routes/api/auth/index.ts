import Router from '@koa/router';
import UserService from 'src/services/user/user.service';
import { RegisterParams } from 'src/services/user/user.type';
import db from 'src/lib/database';
import bcrypt from 'bcrypt';

const auth = new Router();
const userService = UserService.getInstance();
const SALT_ROUNDS: number = 10;

auth.get('/login/local', async ctx => {
  const user = userService.login();
  ctx.body = {
    message: user,
  };
});

auth.post('/register/local', async ctx => {
  const { username, email, password } = ctx.request.body as RegisterParams;
  try {
    const exists = await db.user.findUnique({
      where: {
        username,
      },
    });

    if (exists) {
      ctx.status = 409;
      ctx.body = {
        message: 'Username already exists',
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
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      message: 'Internal server error',
    };
  }
});

export default auth;
