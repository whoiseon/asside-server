import Router from '@koa/router';

const me = new Router();

me.get('/', async ctx => {
  if (!ctx.state.user) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      message: 'Unauthorized',
      name: 'UnauthorizedError',
    };
    return;
  }
  ctx.body = {
    user: ctx.state.user,
  };
});

export default me;
