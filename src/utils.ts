export function isConstructor(imp: any) {
  return !!imp.prototype;
}

export function isFunction(target: any) {
  return Object.prototype.toString.call(target) === '[object Function]' && !target.prototype && target !== Object;
}
