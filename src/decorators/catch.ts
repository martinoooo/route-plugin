import { Service } from '@martinoooo/dependency-injection';
import { ClassDecorator, CATCH_METADATA } from '../declares';

export function Catch(): ClassDecorator {
  return function (target) {
    Service()(target);
    Reflect.defineMetadata(CATCH_METADATA, true, target);
  };
}
