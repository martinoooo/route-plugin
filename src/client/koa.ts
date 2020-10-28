import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import { IKoaServerConfig, MIDDLEWARE_METADATA, MiddlewareMetadata, KoaMiddlewareInterface } from '../declares';
import { parseRoute } from '../core/parseRoute';
import { Container } from '@martinoooo/dependency-injection';

export function useKoaServer(app: Koa, config: IKoaServerConfig) {
  new KoaInstance(app, config);
}

class KoaInstance {
  app: Koa<Koa.DefaultState, Koa.DefaultContext>;
  config: IKoaServerConfig;
  koaRouter: Router<any, {}>;

  constructor(app: Koa, config: IKoaServerConfig) {
    this.app = app;
    this.config = config;
    this.koaRouter = new Router();
    this.init();
  }

  init() {
    this.app.use(bodyParser());
    const { routers = [], middlewares = [] } = this.config;

    const formatedMiddlewares = this.getMiddlewaresInform(middlewares);

    this.registerMiddlewares(formatedMiddlewares);
    this.registerControllers(routers);

    this.app.use(this.koaRouter.routes()).use(this.koaRouter.allowedMethods());
  }

  protected getMiddlewaresInform(middlewares: Function[]): MiddlewareMetadata[] {
    return middlewares
      .map(middleware => {
        const priority = Reflect.getMetadata(MIDDLEWARE_METADATA, middleware);
        return {
          priority,
          middleware,
        };
      })
      .sort((a, b) => a.priority - b.priority);
  }

  protected registryRoute(router: Function) {
    const routes = parseRoute(router);
    routes.map(config => {
      const route = `/${config.baseRoute}${config.route}`;
      (this.koaRouter as any)[config.method.toLowerCase()](route, config.fn);
    });
  }

  registerMiddlewares(middlewares: MiddlewareMetadata[]) {
    middlewares.map(m => {
      const { middleware } = m;
      const instance: KoaMiddlewareInterface = Container.get(middleware);
      this.app.use(function (ctx: any, next: any) {
        return instance.use(ctx, next);
      });
    });
  }

  registerControllers(routers: Function[]) {
    routers.map(router => this.registryRoute(router));
  }
}
