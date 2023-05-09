import Router from '@koa/router';
import { GetUserBody } from 'src/routes/api/user/types';
import db from 'src/lib/database';

const user = new Router();

user.get('/', async ctx => {
  const { username } = ctx.query as GetUserBody;

  const user = await db.user.findUnique({
    where: {
      username,
    },
    include: {
      projects: true,
      teams: true,
      studyGroups: true,
    },
  });

  if (!user) {
    ctx.status = 404;
    ctx.body = {
      statusCode: 404,
      message: 'User not found',
      name: 'NotFoundError',
    };
    return;
  }
  const { passwordHash, ...userInfo } = user;

  ctx.body = userInfo;
});

export default user;
