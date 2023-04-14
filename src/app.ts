import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import routes from './routes';
import logger from 'koa-logger';
import dotenv from 'dotenv';
dotenv.config();

const app = new Koa();
const port: number = 4000;

app.use(logger());
app.use(bodyParser());

app.use(routes.routes()).use(routes.allowedMethods());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
