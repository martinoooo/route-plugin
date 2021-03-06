import 'reflect-metadata';
import {
  Router,
  Get,
  Post,
  Provider,
  useKoaServer,
  Param,
  Query,
  Body,
  Scope,
  Middleware,
  KoaMiddlewareInterface,
} from '../src';
import { Inject, Container } from '@martinoooo/dependency-injection';
import Koa from 'koa';
import request from 'supertest';
import logger from 'koa-logger';

interface IParams {
  id: string;
}

@Provider({ scope: Scope.REQUEST })
class someService {
  private _id!: string;
  public get id(): string {
    return this._id;
  }
  public set id(value: string) {
    this._id = value;
  }

  mySecret() {
    return 'Hello World!' + this.id;
  }
}

@Router('test')
class SomeRouter {
  @Inject()
  private someService: someService;

  @Get('/a/:id')
  async someGetMethod(@Param() params: IParams, ctx) {
    const { id } = params;
    this.someService.id = id;
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, Number(id));
    });
    console.warn('someGetMethod');
    return this.someService.mySecret();
  }
}

@Middleware({ priority: 1 })
class SomeMiddleware implements KoaMiddlewareInterface {
  async use(context: any, next: (err?: any) => Promise<any>): Promise<any> {
    console.warn('do SomeMiddleware before execution...');
    try {
      await next();
      console.warn('do SomeMiddleware after execution');
    } catch (error) {
      console.warn('error handling is also here');
    }
  }
}

@Middleware({ priority: 109 })
class SomeMiddleware2 implements KoaMiddlewareInterface {
  async use(context: any, next: (err?: any) => Promise<any>): Promise<any> {
    console.warn('do SomeMiddleware2 before execution...');
    try {
      await next();
      console.warn('do SomeMiddleware2 after execution');
    } catch (error) {
      console.warn('error handling is also here');
    }
  }
}

describe('Scope_Request', function () {
  let consoleOutput = [];
  const mockedWarn = output => consoleOutput.push(output);
  beforeEach(() => {
    consoleOutput = [];
    console.warn = mockedWarn;
  });

  describe('use inject', () => {
    const app = new Koa();
    useKoaServer(app, {
      routers: [SomeRouter],
      middlewares: [
        SomeMiddleware,
        SomeMiddleware2,
        {
          middleware: logger(),
          priority: 120,
        },
      ],
    });

    it('should get params', async () => {
      let response = await request(app.callback()).get('/test/a/1000');
      expect(response.text).toBe('Hello World!1000');

      expect(consoleOutput).toEqual([
        'do SomeMiddleware before execution...',
        'do SomeMiddleware2 before execution...',
        'someGetMethod',
        'do SomeMiddleware2 after execution',
        'do SomeMiddleware after execution',
      ]);
    });
  });
});
