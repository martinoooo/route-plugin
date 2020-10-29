import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import {
  IKoaServerConfig,
  MIDDLEWARE_METADATA,
  MiddlewareMetadata,
  KoaMiddlewareInterface,
  IKoaMiddlewareConfig,
  KoaCatchInterface,
} from '../declares';
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

  registerMiddlewares(middlewares: MiddlewareMetadata[]) {
    middlewares.map(m => {
      const { middleware } = m;
      this.app.use(function (ctx: any, next: any) {
        return middleware.use(ctx, next);
      });
    });
  }

  registerControllers(routers: Function[]) {
    routers.map(router => this.registryRoute(router));
  }

  protected getMiddlewaresInform(configs: IKoaMiddlewareConfig[]): MiddlewareMetadata[] {
    return configs
      .map(config => {
        if (typeof config === 'function') {
          const priority: number = Reflect.getMetadata(MIDDLEWARE_METADATA, config);
          return {
            priority,
            middleware: Container.get<KoaMiddlewareInterface>(config),
          };
        } else {
          return {
            priority: config.priority,
            middleware: {
              use: config.middleware,
            },
          };
        }
      })
      .sort((a, b) => a.priority - b.priority);
  }

  protected registryRoute(router: Function) {
    const routes = parseRoute(router);
    const { catcher } = this.config;

    routes.map(config => {
      const route = `/${config.baseRoute}${config.route}`;
      const func = async (ctx: any, next: any) => {
        try {
          await config.fn(ctx, next);
        } catch (e) {
          if (catcher) {
            const catcherIns = Container.get<KoaCatchInterface>(catcher);
            await catcherIns.catch(e, ctx);
          } else {
            throw e;
          }
        }
      };
      (this.koaRouter as any)[config.method.toLowerCase()](route, func);
    });
  }
}
