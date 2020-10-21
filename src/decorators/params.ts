import { PARAMS_METADATA } from '../declares';

export const Param = createMappingDecorator((ctx: any) => ctx.params);

export const Body = createMappingDecorator((ctx: any) => ctx.request.body);

export const Query = createMappingDecorator((ctx: any) => ctx.query);

function createMappingDecorator(getParam: Function) {
  return (): ParameterDecorator => {
    return (target, propertyKey, parameterIndex) => {
      let existingParameters: Function[] = Reflect.getOwnMetadata(PARAMS_METADATA, target, propertyKey) || [];
      existingParameters.push(getParam);
      Reflect.defineMetadata(PARAMS_METADATA, existingParameters, target, propertyKey);
    };
  };
}
