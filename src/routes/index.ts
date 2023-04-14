import Router from 'koa-router';
import api from './api';

const routes = new Router();

routes.use('/api', api.routes());

routes.get('/', async ctx => {
  ctx.body = {
    message: 'Hello, Asside Server',
  };
});

export default routes;
