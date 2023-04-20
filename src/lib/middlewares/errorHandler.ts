import { Context, Middleware, Next } from 'koa';

const errorHandler: Middleware = async (ctx: Context, next: Next) => {
  try {
    await next();
  } catch (error: any) {
    ctx.status = error.statusCode || error.status || 500;
    ctx.body = {
      statusCode: ctx.status,
      message: error.message,
    };
  }
};

export default errorHandler;
