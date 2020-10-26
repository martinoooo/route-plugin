import { Service } from '@martinoooo/dependency-injection';
import { ClassDecorator, MiddlewareConfig, MIDDLEWARE_METADATA } from '../declares';

export function Middleware(config?: MiddlewareConfig): ClassDecorator {
  return function (target) {
    const { priority } = config || {};
    Service()(target);
    Reflect.defineMetadata(MIDDLEWARE_METADATA, priority, target);
  };
}
