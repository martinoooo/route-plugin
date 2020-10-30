import { Service } from '@martinoooo/dependency-injection';
import { ClassDecorator, INTERCEPTOR_METADATA } from '../declares';

export function Interceptor(): ClassDecorator {
  return function (target) {
    Service()(target);
    Reflect.defineMetadata(INTERCEPTOR_METADATA, true, target);
  };
}
