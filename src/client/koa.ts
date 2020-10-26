import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { IKoaServerConfig } from '../declares';
import { parseRoute } from '../core/parseRoute';

export function useKoaServer(app: Koa, config: IKoaServerConfig) {
  const koaRouter = new Router();
  const { routers = [], middlewares = [] } = config;

  routers.map(router => registryRoute(koaRouter, router));

  app.use(bodyParser());
  app.use(koaRouter.routes()).use(koaRouter.allowedMethods());

  //   registerMiddleware(middleware: MiddlewareMetadata): void {
  //     if ((middleware.instance as KoaMiddlewareInterface).use) {
  //         this.koa.use(function (ctx: any, next: any) {
  //             return (middleware.instance as KoaMiddlewareInterface).use(ctx, next);
  //         });
  //     }
  // }
}

function registryRoute(koaRouter: any, router: Function) {
  const routes = parseRoute(router);
  routes.map(config => {
    const route = `/${config.baseRoute}${config.route}`;
    koaRouter[config.method.toLowerCase()](route, config.fn);
  });
}
