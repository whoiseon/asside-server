import { Context, Middleware, Next } from 'koa';
import { AccessTokenPayload, validateToken } from 'src/lib/tokens';

export const consumeUser: Middleware = async (ctx: Context, next: Next) => {
  if (ctx.path.includes('/auth/logout')) return next(); // skip this middleware for logout route
  console.log(ctx.path);
  ctx.state.user = {
    id: 1,
    username: 'test',
    email: 'waeifawef@naver.com',
  };
  return next();
  // let accessToken: string | undefined = ctx.cookies.get('access_token');
  // const refreshToken: string | undefined = ctx.cookies.get('refresh_token');
  //
  // const { authorization } = ctx.request.headers;
  //
  // if (!accessToken && authorization) {
  //   accessToken = authorization.split(' ')[1];
  // }
  //
  // try {
  //   if (!accessToken) {
  //     throw new Error('NoAccessToken');
  //   }
  //   const accessTokenData = await validateToken<AccessTokenPayload>(accessToken);
  //
  //   ctx.state.userId = accessTokenData.userId;
  //   // refresh token when life < 30 mins
  //   const diff = accessTokenData.exp * 3000 - new Date().getTime();
  //   if (diff < 1000 * 60 * 30 && refreshToken) {
  //     await
  //   }
  // }
};
