import 'reflect-metadata';
import { Router, Get, Post, Provider, useKoaServer, Param, Query, Body, Scope } from '../src';
import { Inject, Container } from '@martinoooo/dependency-injection';
import Koa from 'koa';
import request from 'supertest';

interface IParams {
  id: string;
}

abstract class Factory {
  abstract get id(): string;
  abstract set id(v: string);
  abstract mySecret(): string;
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

@Provider({ scope: Scope.REQUEST, token: 'sugar-factory' })
class namedService extends Factory {
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

describe('Scope_Request', function () {
  describe('use inject', () => {
    @Router('test')
    class SomeClass {
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
        return this.someService.mySecret();
      }
    }

    const app = new Koa();
    useKoaServer(app, {
      routers: [SomeClass],
    });

    it('should get params', async () => {
      let promise1 = request(app.callback()).get('/test/a/1000');
      let promise2 = request(app.callback()).get('/test/a/1');
      const [response1, response2] = await Promise.all([promise1, promise2]);
      expect(response1.text).toBe('Hello World!1000');
      expect(response2.text).toBe('Hello World!1');
    });
  });

  describe('use named inject', () => {
    @Router('test')
    class SomeClass {
      @Inject({ token: 'sugar-factory' })
      private someService: Factory;

      @Get('/a/:id')
      async someGetMethod(@Param() params: IParams, ctx) {
        const { id } = params;
        this.someService.id = id;
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, Number(id));
        });
        return this.someService.mySecret();
      }
    }

    const app = new Koa();
    useKoaServer(app, {
      routers: [SomeClass],
    });

    it('should get params', async () => {
      let promise1 = request(app.callback()).get('/test/a/1000');
      let promise2 = request(app.callback()).get('/test/a/1');
      const [response1, response2] = await Promise.all([promise1, promise2]);
      expect(response1.text).toBe('Hello World!1000');
      expect(response2.text).toBe('Hello World!1');
    });
  });

  describe('use constructor', () => {
    @Router('test')
    class SomeClass {
      constructor(private someService: someService) {}

      @Get('/a/:id')
      async someGetMethod(@Param() params: IParams, ctx) {
        const { id } = params;
        this.someService.id = id;
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, Number(id));
        });
        return this.someService.mySecret();
      }
    }

    const app = new Koa();
    useKoaServer(app, {
      routers: [SomeClass],
    });

    it('should get params', async () => {
      let promise1 = request(app.callback()).get('/test/a/1000');
      let promise2 = request(app.callback()).get('/test/a/1');
      const [response1, response2] = await Promise.all([promise1, promise2]);
      expect(response1.text).toBe('Hello World!1000');
      expect(response2.text).toBe('Hello World!1');
    });
  });

  describe('use named inject constructor', () => {
    @Router('test')
    class SomeClass {
      constructor(
        @Inject({ token: 'sugar-factory' })
        private someService: Factory
      ) {}

      @Get('/a/:id')
      async someGetMethod(@Param() params: IParams, ctx) {
        const { id } = params;
        this.someService.id = id;
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, Number(id));
        });
        return this.someService.mySecret();
      }
    }

    const app = new Koa();
    useKoaServer(app, {
      routers: [SomeClass],
    });

    it('should get params', async () => {
      let promise1 = request(app.callback()).get('/test/a/1000');
      let promise2 = request(app.callback()).get('/test/a/1');
      const [response1, response2] = await Promise.all([promise1, promise2]);
      expect(response1.text).toBe('Hello World!1000');
      expect(response2.text).toBe('Hello World!1');
    });
  });
});
