import 'reflect-metadata';
import { Router, Get, Post, useKoaServer, Param, Query, Body, Provider } from '../src';
import { Inject } from '@martinoooo/dependency-injection';
import Koa from 'koa';
import request from 'supertest';

describe('Container', function () {
  describe('registry', () => {
    interface IParams {
      id: string;
    }

    @Provider()
    class someService {
      mySecret(id) {
        return 'Hello World!' + id;
      }
    }

    @Router('test')
    class SomeClass {
      @Inject()
      private someService: someService;

      @Get('/a/:id')
      async someGetMethod(@Param() params: IParams, ctx) {
        const { id } = params;
        ctx.body = this.someService.mySecret(id);
      }

      @Get('/b')
      queryGetMethod(@Query() params: IParams, ctx) {
        const { id } = params;
        ctx.body = this.someService.mySecret(id);
      }

      @Post('/c')
      somePostMethod(@Body() params: IParams, ctx) {
        const { id } = params;
        ctx.body = this.someService.mySecret(id);
      }
    }

    const app = new Koa();

    useKoaServer(app, {
      routers: [SomeClass],
    });

    const http_client = app.listen(3001);

    it('should get params', async () => {
      const response = await request(http_client).get('/test/a/1000');
      expect(response.status).toEqual(200);
      expect(response.text).toBe('Hello World!1000');
    });

    it('should get query', async function () {
      const response = await request(http_client).get('/test/b?id=23');
      expect(response.status).toEqual(200);
      expect(response.text).toBe('Hello World!23');
    });

    it('should get body', async function () {
      const response = await request(http_client).post('/test/c').send({ id: 23 });
      expect(response.status).toEqual(200);
      expect(response.text).toBe('Hello World!23');
    });

    http_client.close();
  });
});
