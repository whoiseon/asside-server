import Router from '@koa/router';

const me = new Router();

me.get('/', async ctx => {
  if (ctx.state.isExpiredToken) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      message: 'Token is expired',
      name: 'TokenExpiredError',
      payload: {
        isExpiredToken: ctx.state.isExpiredToken,
      },
    };
    return;
  }
  if (!ctx.state.user) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      message: 'Unauthorized',
      name: 'UnauthorizedError',
      payload: {
        isExpiredToken: ctx.state.isExpiredToken,
      },
    };
    return;
  }
  ctx.body = ctx.state.user;
});

export default me;
