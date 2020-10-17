import 'reflect-metadata';
import { Router, Get, Post, PATH_METADATA, useKoaServer, Param, Query, Body } from '../src';
import { Service, Inject } from '@martinoooo/dependency-injection';
import Koa from 'koa';
import request from 'supertest';

describe('Container', function () {
  describe('registry', () => {
    interface IParams {
      id: string;
    }

    @Service()
    class someService {
      private _user!: string;
      public get user(): string {
        return this._user;
      }
      public set user(value: string) {
        this._user = value;
      }

      mySecret() {
        return 'Hello World!' + this.user;
      }
    }

    @Router('test')
    class SomeClass {
      @Inject()
      private someService: someService;

      @Get('/a/:id')
      async someGetMethod(@Param() params: IParams, ctx) {
        const { id } = params;
        this.someService.user = id;
        await new Promise(resolve => {
          setTimeout(() => {
            resolve();
          }, Number(id));
        });
        ctx.body = this.someService.mySecret();
      }

      @Get('/b')
      queryGetMethod(@Query() params: IParams, ctx) {
        const { id } = params;
        ctx.body = this.someService.mySecret();
      }

      @Post('/c')
      somePostMethod(@Body() params: IParams, ctx) {
        const { id } = params;
        ctx.body = this.someService.mySecret();
      }
    }

    const app = new Koa();

    useKoaServer(app, {
      routers: [SomeClass],
    });

    const http_client = app.listen(3000); // run your express server

    it('should get params', async () => {
      let promise1 = request(http_client).get('/test/a/1000');
      let promise2 = request(http_client).get('/test/a/1');
      const [response1, response2] = await Promise.all([promise1, promise2]);
      expect(response1.status).toEqual(200);
      expect(response1.text).toBe('Hello World!1000');

      expect(response2.status).toEqual(200);
      expect(response2.text).toBe('Hello World!1');
    });

    // it('should get query', async function () {
    //   const response = await request(http_client).get('/test/b?id=23');
    //   expect(response.status).toEqual(200);
    //   expect(response.text).toBe('Hello World!23');
    // });

    // it('should get body', async function () {
    //   const response = await request(http_client).post('/test/c').send({ id: 23 });
    //   expect(response.status).toEqual(200);
    //   expect(response.text).toBe('Hello World!23');
    // });

    http_client.close();
  });
});
