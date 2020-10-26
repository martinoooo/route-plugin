import { Token } from '@martinoooo/dependency-injection';

export const METHOD_METADATA = Symbol('method');
export const PATH_METADATA = Symbol('path');
export const PARAMS_METADATA = Symbol('params');
export const SCOPE_REQUEST_METADATA = Symbol('scope_request');
export const MIDDLEWARE_METADATA = Symbol('middleware');

export interface IKoaServerConfig {
  routers?: Function[];
  middlewares?: Function[];
}

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

export interface KoaMiddlewareInterface {
  use(context: any, next: (err?: any) => Promise<any>): Promise<any>;
}

export type ClassDecorator = <T extends { new (...args: any[]): {} }>(target: T) => T | void;
