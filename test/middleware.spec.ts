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
import app from './koa-instance';
import request from 'supertest';

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
    console.log(111);
    ctx.body = this.someService.mySecret();
  }
}

@Middleware({ priority: 1 })
class SomeMiddleware implements KoaMiddlewareInterface {
  async use(context: any, next: (err?: any) => Promise<any>): Promise<any> {
    console.log('do something before execution...');
    try {
      await next();
      console.log('do something after execution');
    } catch (error) {
      console.log('error handling is also here');
    }
  }
}

@Middleware({ priority: 109 })
class SomeMiddleware2 implements KoaMiddlewareInterface {
  async use(context: any, next: (err?: any) => Promise<any>): Promise<any> {
    console.log('do something before execution...');
    try {
      await next();
      console.log('do something after execution');
    } catch (error) {
      console.log('error handling is also here');
    }
  }
}

describe('Scope_Request', function () {
  describe('use inject', () => {
    useKoaServer(app, {
      routers: [SomeRouter],
      middlewares: [SomeMiddleware, SomeMiddleware2],
    });

    it('should get params', async () => {
      let response = await request(app.callback()).get('/test/a/1000');
      expect(response.text).toBe('Hello World!1000');
    });
  });
});
