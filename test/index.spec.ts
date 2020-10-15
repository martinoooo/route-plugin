import 'reflect-metadata';
import { Router, Get, Post, PATH_METADATA, useKoaServer } from '../src';
import Koa from 'koa';
import request from 'supertest';

describe('Container', function () {
  describe('registry', () => {
    it('should use the registried instance', async function () {
      @Router('test')
      class SomeClass {
        @Get('/a')
        someGetMethod(ctx) {
          ctx.body = 'Hello World!';
        }

        @Post('/b')
        somePostMethod() {}
      }

      Reflect.getMetadata(PATH_METADATA, SomeClass); // '/test'

      const app = new Koa();

      useKoaServer(app, {
        routers: [SomeClass],
      });

      const http_client = app.listen(3000); // run your express server

      const response = await request(http_client).get('/test/a');
      expect(response.status).toEqual(200);
      expect(response.text).toContain('Hello World!');

      // console.log(mapRoute(new SomeClass()));
      http_client.close();
      /**
       * [{
       *    route: '/a',
       *    method: 'GET',
       *    fn: someGetMethod() { ... },
       *    methodName: 'someGetMethod'
       *  },{
       *    route: '/b',
       *    method: 'POST',
       *    fn: somePostMethod() { ... },
       *    methodName: 'somePostMethod'
       * }]
       *
       */
    });
  });
});
