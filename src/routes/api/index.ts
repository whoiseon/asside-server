import Router from '@koa/router';
import test from './test';

const api = new Router();
api.use('/test', test.routes());

export default api;
