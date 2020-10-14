import 'reflect-metadata';
import { Controller, Get, Post, PATH_METADATA, mapRoute } from '../src';

describe('Container', function () {
  describe('registry', () => {
    it('should use the registried instance', function () {
      @Controller('/test')
      class SomeClass {
        @Get('/a')
        someGetMethod() {
          return 'hello world';
        }

        @Post('/b')
        somePostMethod() {}
      }

      Reflect.getMetadata(PATH_METADATA, SomeClass); // '/test'

      console.log(mapRoute(new SomeClass()));

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
