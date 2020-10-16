import { PARAMS_METADATA } from '../declares';

export const Param = (): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    let existingParameters: Function[] = Reflect.getOwnMetadata(PARAMS_METADATA, target, propertyKey) || [];
    const getParam = (ctx: any) => ctx.params;
    existingParameters.push(getParam);
    Reflect.defineMetadata(PARAMS_METADATA, existingParameters, target, propertyKey);
  };
};

export const Body = (): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    let existingParameters: Function[] = Reflect.getOwnMetadata(PARAMS_METADATA, target, propertyKey) || [];
    const getParam = (ctx: any) => ctx.request.body;
    existingParameters.push(getParam);
    Reflect.defineMetadata(PARAMS_METADATA, existingParameters, target, propertyKey);
  };
};

export const Query = (): ParameterDecorator => {
  return (target, propertyKey, parameterIndex) => {
    let existingParameters: Function[] = Reflect.getOwnMetadata(PARAMS_METADATA, target, propertyKey) || [];
    const getParam = (ctx: any) => ctx.query;
    existingParameters.push(getParam);
    Reflect.defineMetadata(PARAMS_METADATA, existingParameters, target, propertyKey);
  };
};
