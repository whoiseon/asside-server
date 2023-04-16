import Router from '@koa/router';
import UserService from 'src/services/user/user.service';
import { LoginParams, RegisterParams } from 'src/services/user/user.type';

const auth = new Router();
const userService = UserService.getInstance();

auth.post('/login/local', async ctx => {
  const {
    request: { body },
  } = ctx;
  const user = await userService.login(ctx, body as LoginParams);
  console.log(user);
  ctx.body = user;
});

auth.post('/register/local', async ctx => {
  const {
    request: { body },
  } = ctx;
  const user = await userService.register(ctx, body as RegisterParams);
  ctx.body = {
    registered: !!user,
  };
});

export default auth;
