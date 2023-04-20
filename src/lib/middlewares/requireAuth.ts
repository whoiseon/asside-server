import { Context, Middleware, Next } from 'koa';

const requireAuth: Middleware = async (ctx: Context, next: Next) => {
  if (ctx.state.isExpiredToken) {
    ctx.status = 401;
    ctx.body = {
      statusCode: 401,
      message: 'Token is expired',
      name: 'TokenExpiredError',
      payload: {
        isExpiredToken: true,
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
        isExpiredToken: false,
      },
    };
    return;
  }

  return next();
};

export default requireAuth;
