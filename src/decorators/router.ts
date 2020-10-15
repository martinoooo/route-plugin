import { METHOD_METADATA, PATH_METADATA, IRouteConfig } from '../declares';
import { isConstructor, isFunction } from '../utils';

export const Router = (path: string): ClassDecorator => {
  return target => {
    Reflect.defineMetadata(PATH_METADATA, path, target);
  };
};

const createMappingDecorator = (method: string) => (path: string): MethodDecorator => {
  return (target, key, descriptor) => {
    Reflect.defineMetadata(PATH_METADATA, path, descriptor.value || {});
    Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value || {});
  };
};

export const Get = createMappingDecorator('GET');
export const Post = createMappingDecorator('POST');

export function parseRoute(target: Function): IRouteConfig {
  const prototype = target.prototype;
  const baseRoute = Reflect.getMetadata(PATH_METADATA, target);

  // 筛选出类的 methodName
  const methodsNames = Object.getOwnPropertyNames(prototype).filter(
    item => !isConstructor(item) && isFunction(prototype[item])
  );
  return methodsNames.map(methodName => {
    const fn = prototype[methodName];

    // 取出定义的 metadata
    const route = Reflect.getMetadata(PATH_METADATA, fn);
    const method = Reflect.getMetadata(METHOD_METADATA, fn);
    return {
      baseRoute,
      route,
      method,
      fn,
      methodName,
    };
  });
}
