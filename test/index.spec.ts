import 'reflect-metadata';
import { Router, Get, Post, PATH_METADATA, useKoaServer, Param, Query, Body } from '../src';
import Koa from 'koa';
import request from 'supertest';

describe('Container', function () {
  describe('registry', () => {
    interface IParams {
      id: string;
    }
    @Router('test')
    class SomeClass {
      @Get('/a/:id')
      someGetMethod(@Param() params: IParams, ctx) {
        const { id } = params;
        ctx.body = this.mySecret(id);
      }

      @Get('/b')
      queryGetMethod(@Query() params: IParams, ctx) {
        const { id } = params;
        ctx.body = this.mySecret(id);
      }

      @Post('/c')
      somePostMethod(@Body() params: IParams, ctx) {
        const { id } = params;
        ctx.body = this.mySecret(id);
      }

      private mySecret(id) {
        return 'Hello World!' + id;
      }
    }

    Reflect.getMetadata(PATH_METADATA, SomeClass); // '/test'

    const app = new Koa();

    useKoaServer(app, {
      routers: [SomeClass],
    });

    const http_client = app.listen(3000); // run your express server

    it('should get params', async function () {
      const response = await request(http_client).get('/test/a/23');
      expect(response.status).toEqual(200);
      expect(response.text).toBe('Hello World!23');
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
