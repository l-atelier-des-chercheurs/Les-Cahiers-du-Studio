export default (instance, proto) => {
  if (proto == null) proto = Object.getPrototypeOf(instance)

  const propertyNames = Object.getOwnPropertyNames(proto)
  for (let name of propertyNames) {
    const value = proto[name]
    if (typeof value === 'function') instance[name] = proto[name].bind(instance)
  }
}
