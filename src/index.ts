import 'reflect-metadata';

export const METHOD_METADATA = 'method';
export const PATH_METADATA = 'path';

function isConstructor(imp: any) {
  return !!imp.prototype;
}

function isFunction(target: any) {
  return Object.prototype.toString.call(target) === '[object Function]' && !target.prototype && target !== Object;
}

export const Controller = (path: string): ClassDecorator => {
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

export function mapRoute(instance: Object) {
  const prototype = Object.getPrototypeOf(instance);

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
      route,
      method,
      fn,
      methodName,
    };
  });
}
