import Router from '@koa/router';
import test from './test';
import auth from './auth';
import me from './me';
import user from './user';

const api = new Router();
api.use('/test', test.routes());
api.use('/auth', auth.routes());
api.use('/me', me.routes());
api.use('/user', user.routes());

export default api;
