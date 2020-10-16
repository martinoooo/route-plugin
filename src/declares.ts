export const METHOD_METADATA = Symbol('method');
export const PATH_METADATA = Symbol('path');

export interface IKoaServerConfig {
  routers?: Function[];
}

export type IRouteConfig = {
  baseRoute: string;
  route: string;
  method: string;
  fn: Function;
  methodName: string;
};

export type ClassDecorator = <T extends { new (...args: any[]): {} }>(target: T) => T | void;
