import { Service } from '@martinoooo/dependency-injection';
import { ClassDecorator, ProviderConfig, Scope, SCOPE_REQUEST_METADATA } from '../declares';

export function Provider(config?: ProviderConfig): ClassDecorator {
  return function (target) {
    const { scope, token } = config || {};
    const transient = scope === Scope.TRANSIENT ? true : false;
    Service({ token, transient })(target);
    if (scope === Scope.REQUEST) {
      Reflect.defineMetadata(SCOPE_REQUEST_METADATA, true, target);
    }
  };
}
