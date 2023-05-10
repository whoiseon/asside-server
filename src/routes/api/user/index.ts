import Router from '@koa/router';
import { GetUserProfileBody, GetUserQuery } from 'src/routes/api/user/types';
import db from 'src/lib/database';
import requireAuth from 'src/lib/middlewares/requireAuth';

const user = new Router();

user.get('/', async ctx => {
  const { username } = ctx.query as GetUserQuery;

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

user.patch('/profile', requireAuth, async ctx => {
  const { username, description } = ctx.request.body as GetUserProfileBody;
  const { id } = ctx.state.user;
  const updatedResult = {
    username: false,
    description: false,
  };

  if (!username && !description) return;

  // change username
  if (username) {
    const existingUser = await db.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUser) {
      ctx.status = 409;
      ctx.body = {
        statusCode: 409,
        message: 'Username already exists',
        name: 'ExistsError',
      };
      return;
    }

    await db.user.update({
      where: {
        id,
      },
      data: {
        username,
      },
    });

    updatedResult.username = true;
    ctx.state.user.username = username;
  }

  // change description
  if (description) {
    await db.user.update({
      where: {
        id,
      },
      data: {
        description,
      },
    });

    updatedResult.description = true;
  }

  ctx.body = updatedResult;
});

export default user;
