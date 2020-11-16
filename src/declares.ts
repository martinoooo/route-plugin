import { Token } from '@martinoooo/dependency-injection';
import { Middleware } from 'koa';

export const METHOD_METADATA = Symbol('method');
export const PATH_METADATA = Symbol('path');
export const PARAMS_METADATA = Symbol('params');
export const SCOPE_REQUEST_METADATA = Symbol('scope_request');
export const MIDDLEWARE_METADATA = Symbol('middleware');
export const CATCH_METADATA = Symbol('catch');
export const INTERCEPTOR_METADATA = Symbol('interceptor');
export const SCOPE_SERVICE_CACHE = Symbol('cache');
export const IS_SCOPE_SERVICE = Symbol('is_scope');

export interface IKoaServerConfig {
  routers?: Function[];
  middlewares?: Array<IKoaMiddlewareConfig>;
  catcher?: typeof KoaCatchInterface;
  interceptors?: Array<typeof KoaInterCeptorInterface>;
}

export type IKoaMiddlewareConfig = Function | (MiddlewareConfig & { middleware: Middleware });

export type IRouteConfig = {
  baseRoute: string;
  route: string;
  method: string;
  fn: Function;
  methodName: string;
};

export enum Scope {
  /**
   * The provider can be shared across multiple classes. The provider lifetime
   * is strictly tied to the application lifecycle. Once the application has
   * bootstrapped, all providers have been instantiated.
   */
  DEFAULT,
  /**
   * A new private instance of the provider is instantiated for every use
   */
  TRANSIENT,
  /**
   * A new instance is instantiated for each request processing pipeline
   */
  REQUEST,
}

export type ProviderConfig = {
  scope?: Scope;
  token?: Token;
};

export type MiddlewareConfig = {
  priority: number;
};

export type MiddlewareMetadata = MiddlewareConfig & {
  middleware: KoaMiddlewareInterface;
};

export interface KoaMiddlewareInterface {
  use: Middleware;
}

export abstract class KoaCatchInterface {
  abstract catch(exception: any, context: any): any;
}

export abstract class KoaInterCeptorInterface {
  abstract intercept(content: any): any;
}

export type ClassDecorator = <T extends { new (...args: any[]): {} }>(target: T) => T | void;
