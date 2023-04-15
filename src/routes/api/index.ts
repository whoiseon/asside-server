import Router from '@koa/router';
import test from './test';
import auth from './auth';

const api = new Router();
api.use('/test', test.routes());
api.use('/auth', auth.routes());

export default api;
