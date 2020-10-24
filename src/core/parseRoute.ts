import { METHOD_METADATA, PATH_METADATA, IRouteConfig, PARAMS_METADATA, SCOPE_REQUEST_METADATA } from '../declares';
import { isConstructor, isFunction } from '../utils';
import { Container, depsMetadata, DepsConfig } from '@martinoooo/dependency-injection';

export function parseRoute(target: Function): IRouteConfig[] {
  const prototype = target.prototype;
  const baseRoute = Reflect.getMetadata(PATH_METADATA, target);

  // 筛选出类的 methodName
  const methodsNames = Object.getOwnPropertyNames(prototype).filter(
    item => !isConstructor(item) && isFunction(prototype[item])
  );

  return methodsNames
    .filter(methodName => {
      const fn = prototype[methodName];
      const method = Reflect.getMetadata(METHOD_METADATA, fn);
      if (method) return true;
    })
    .map(methodName => {
      const fn = prototype[methodName];

      // 取出定义的 metadata
      const route = Reflect.getMetadata(PATH_METADATA, fn);
      const method = Reflect.getMetadata(METHOD_METADATA, fn);

      const func = async (ctx: any, next: any) => {
        const parametersFactory: Function[] = Reflect.getOwnMetadata(PARAMS_METADATA, prototype, methodName) || [];
        const decoratorParams = parametersFactory.map(paramFactory => {
          return paramFactory(ctx);
        });
        const params = decoratorParams.concat([ctx, next]);

        const hasScopeService = analyzeDeps(target);
        if (hasScopeService.length) {
          Container.registryScope({ token: ctx, providers: hasScopeService, imp: target });
          const instance: any = Container.get(ctx, target);
          await instance[methodName].apply(instance, params);
          Container.deleteScope(ctx);
        } else {
          const instance: any = Container.get(baseRoute);
          return instance[methodName].apply(instance, params);
        }
      };

      return {
        baseRoute,
        route,
        method,
        fn: func,
        methodName,
      };
    });
}

// 分析依赖是否有request scope
function analyzeDeps(target: Function) {
  const consDeps = analyzeConstructor(target);
  const injectDeps = analyzeInject(target);

  return consDeps.concat(injectDeps);
}

function analyzeConstructor(target: Function) {
  const paramsDeps: DepsConfig[] = Reflect.getMetadata('design:paramtypes', target) || [];
  const paramsInject: DepsConfig[] = Reflect.getMetadata(depsMetadata, target) || [];

  const deps: any[] = paramsDeps
    .map((provider: any, index) => {
      const paramDep = paramsInject.find(dep => dep.index === index);
      // should return paramsInject
      if (paramDep && paramDep.typeName()) {
        return getInjectProvider(paramDep);
      } else if (Reflect.getMetadata(SCOPE_REQUEST_METADATA, provider)) {
        return provider;
      }
    })
    .filter(dep => !!dep);

  return deps;
}

function analyzeInject(target: Function) {
  const injects: DepsConfig[] = Reflect.getMetadata(depsMetadata, target.prototype) || [];
  const deps = injects
    .map(dep => {
      if (dep.propertyKey) {
        return getInjectProvider(dep);
      }
      return false;
    })
    .filter(dep => !!dep);

  return deps;
}

/**
 * 获取创建scope service的config
 * @param dep
 */
function getInjectProvider(dep: DepsConfig) {
  const typeName = dep.typeName();
  const serverConfig = Container.getServerConfig(typeName);
  const { imp } = serverConfig || {};
  if (Reflect.getMetadata(SCOPE_REQUEST_METADATA, imp)) {
    return {
      token: typeName,
      imp,
    };
  }
  return null;
}
