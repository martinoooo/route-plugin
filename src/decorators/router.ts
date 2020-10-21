import { METHOD_METADATA, PATH_METADATA, ClassDecorator } from '../declares';
import { Service } from '@martinoooo/dependency-injection';

const createMappingDecorator = (method: string) => (path: string): MethodDecorator => {
  return (target, key, descriptor) => {
    Reflect.defineMetadata(PATH_METADATA, path, descriptor.value || {});
    Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value || {});
  };
};

export const Router = (path: string): ClassDecorator => {
  return target => {
    Service({ token: path })(target);
    Reflect.defineMetadata(PATH_METADATA, path, target);
  };
};
export const Get = createMappingDecorator('GET');
export const Post = createMappingDecorator('POST');
