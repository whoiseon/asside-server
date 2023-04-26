import { Context, Middleware, Next } from 'koa';
import { AccessTokenPayload, validateToken } from 'src/lib/tokens';
import { JsonWebTokenError } from 'jsonwebtoken';

const consumeUser: Middleware = async (ctx: Context, next: Next) => {
  ctx.state.isExpiredToken = false;
  if (ctx.path.includes('/auth/logout') || ctx.path.includes('/auth/signup')) return next(); // skip this middleware for logout route

  const { authorization } = ctx.request.headers;

  let accessToken: string | undefined = ctx.cookies.get('access_token');
  const refreshToken: string | undefined = ctx.cookies.get('refresh_token');

  if (!accessToken && authorization) {
    accessToken = authorization.split(' ')[1];
  }

  if (refreshToken && !accessToken) {
    ctx.state.isExpiredToken = true;
    return next();
  }

  try {
    if (!accessToken) {
      return next();
    }
    const accessTokenData = await validateToken<AccessTokenPayload>(accessToken);
    ctx.state.user = {
      id: accessTokenData.userId,
      username: accessTokenData.username,
      email: accessTokenData.email,
    };
  } catch (e: any) {
    if (e instanceof JsonWebTokenError) {
      if (e.name === 'TokenExpiredError') {
        ctx.state.isExpiredToken = true;
      }
    }
    if (!refreshToken) return next();
  }

  return next();
};

export default consumeUser;
