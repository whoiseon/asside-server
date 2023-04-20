import Router from '@koa/router';
import requireAuth from 'src/lib/middlewares/requireAuth';

const me = new Router();

me.get('/', requireAuth, async ctx => {
  ctx.body = ctx.state.user;
});

export default me;
