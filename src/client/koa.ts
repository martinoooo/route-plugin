import Koa from 'koa';
import Router from 'koa-router';
import { IKoaServerConfig } from '../declares';
import { parseRoute } from '../decorators/router';

export function useKoaServer(app: Koa, config: IKoaServerConfig) {
  const koaRouter = new Router();
  const { routers = [] } = config;

  routers.map(router => registryRoute(koaRouter, router));

  app.use(koaRouter.routes()).use(koaRouter.allowedMethods());
}

function registryRoute(koaRouter: any, router: Function) {
  const routes = parseRoute(router);
  routes.map(config => {
    const route = `/${config.baseRoute}${config.route}`;
    koaRouter[config.method.toLowerCase()](route, config.fn);
  });
}
