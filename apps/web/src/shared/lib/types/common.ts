export type Loadable<Data> = {
  data: Data;
  isLoading: boolean;
  isError: boolean;
};

export type Simplify<TType> = TType extends readonly unknown[] | Date
  ? TType
  : {
      [K in keyof TType]: TType[K];
    } & {};

export type MyOmit<T, Key extends keyof T> = {
  [K in keyof T as K extends Key ? never : K]: T[K];
};
