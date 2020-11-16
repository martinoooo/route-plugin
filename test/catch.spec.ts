import 'reflect-metadata';
import { Router, Get, useKoaServer, Catch, KoaCatchInterface } from '../src';
import Koa from 'koa';
import request from 'supertest';
import logger from 'koa-logger';

@Catch()
class someCatch implements KoaCatchInterface {
  catch(exception, ctx) {
    ctx.body = 'catch handler';
  }
}

@Router('test')
class SomeRouter {
  @Get('/a/:id')
  async someGetMethod() {
    throw new Error('error there');
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
      catcher: someCatch,
    });

    it('should get params', async () => {
      let response = await request(app.callback()).get('/test/a/1000');
      expect(response.text).toBe('catch handler');
    });
  });
});
