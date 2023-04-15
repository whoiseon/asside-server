import Router from '@koa/router';

const test = new Router();

test.get('/ping', async ctx => {
  ctx.body = {
    message: 'pong',
  };
});

export default test;
