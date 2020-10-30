import 'reflect-metadata';
import { Router, Get, useKoaServer, Interceptor, KoaInterCeptorInterface } from '../src';
import app from './koa-instance';
import request from 'supertest';
import logger from 'koa-logger';

@Interceptor()
class someInterceptor implements KoaInterCeptorInterface {
  intercept(content: any) {
    return {
      code: 200,
      message: 'success',
      data: content,
    };
  }
}

@Router('test')
class SomeRouter {
  @Get('/a/:id')
  async someGetMethod() {
    return 'hello world';
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
    useKoaServer(app, {
      routers: [SomeRouter],
      interceptors: [someInterceptor],
    });

    it('should get params', async () => {
      let response = await request(app.callback()).get('/test/a/1000');
      expect(JSON.parse(response.text)).toStrictEqual({ code: 200, data: 'hello world', message: 'success' });
    });
  });
});
