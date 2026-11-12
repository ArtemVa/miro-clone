import { type AxiosResponse, type AxiosRequestConfig as OriginalAxiosRequestConfig } from 'axios';

export type ApiResponse<T> = Promise<AxiosResponse<T>>;

export type RequestConfig<Params = undefined> = Params extends undefined
  ? { config?: OriginalAxiosRequestConfig }
  : { params: Params; config?: OriginalAxiosRequestConfig };
