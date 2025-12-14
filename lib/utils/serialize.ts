/**
 * Recursively converts BigInt values to numbers in an object
 * This is needed because JSON.stringify cannot serialize BigInt
 */
export function serializeBigInt<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (typeof obj === 'bigint') {
    return Number(obj) as T
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeBigInt) as T
  }

  if (obj instanceof Date) {
    return obj as T
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeBigInt((obj as Record<string, unknown>)[key])
      }
    }
    return result as T
  }

  return obj
}
