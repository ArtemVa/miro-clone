export const isDef = <Value>(value: Value | undefined): value is Value => {
  return value !== undefined;
};

export const isDefAndNotNull = <Value>(value: Value | null | undefined): value is Value => {
  return value !== undefined && value !== null;
};

export function assertDefAndNotNull<Value>(value: Value | null | undefined, message: string): asserts value is Value {
  if (!isDefAndNotNull(value)) {
    throw new Error(message);
  }
}
