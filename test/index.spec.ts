import 'reflect-metadata';
import { Router, Get, Post, useKoaServer, Param, Query, Body, Provider } from '../src';
import { Inject } from '@martinoooo/dependency-injection';
import app from './koa-instance';
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
        return this.someService.mySecret(id);
      }

      @Get('/b')
      queryGetMethod(@Query() params: IParams, ctx) {
        const { id } = params;
        return this.someService.mySecret(id);
      }

      @Post('/c')
      somePostMethod(@Body() params: IParams, ctx) {
        const { id } = params;
        return this.someService.mySecret(id);
      }
    }

    useKoaServer(app, {
      routers: [SomeClass],
    });

    it('should get params', async () => {
      const response = await request(app.callback()).get('/test/a/1000');
      expect(response.status).toEqual(200);
      expect(response.text).toBe('Hello World!1000');
    });

    it('should get query', async function () {
      const response = await request(app.callback()).get('/test/b?id=23');
      expect(response.status).toEqual(200);
      expect(response.text).toBe('Hello World!23');
    });

    it('should get body', async function () {
      const response = await request(app.callback()).post('/test/c').send({ id: 23 });
      expect(response.status).toEqual(200);
      expect(response.text).toBe('Hello World!23');
    });
  });
});
