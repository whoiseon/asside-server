import Router from '@koa/router';
import { GetUserBody } from 'src/routes/api/user/types';
import db from 'src/lib/database';

const user = new Router();

user.get('/', async ctx => {
  const { userId } = ctx.request.body as GetUserBody;
  const user = await db.user.findUnique({
    where: {
      id: Number(userId),
    },
    include: {
      teams: true,
      projects: true,
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

  ctx.body = user;
});

export default user;
