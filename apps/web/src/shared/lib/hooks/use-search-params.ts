import { useEffect, useState } from 'react';

export type UrlSearchParamMode = 'hash-params' | 'hash' | 'history';

export interface UseUrlSearchParamOptions<Value> {
  initialValue?: Value;
  mode?: UrlSearchParamMode;
  write?: 'push' | 'replace';
  deserializer?: (value: string) => Value;
  serializer?: (value: Value) => string;
}

export interface UseUrlSearchParamsActionOptions {
  write?: 'push' | 'replace';
}

export interface UseUrlSearchParamReturn<Value> {
  value: Value | undefined;
  remove: (options?: UseUrlSearchParamsActionOptions) => void;
  set: (value: Value, options?: UseUrlSearchParamsActionOptions) => void;
}

export const URL_SEARCH_PARAMS_EVENT = 'reactuse-url-search-params-event';

export const getUrlSearchParams = (mode: UrlSearchParamMode = 'history') => {
  const { search, hash } = window.location;

  let path = '';

  if (mode === 'history') path = search;
  if (mode === 'hash-params') path = hash.replace(/^#/, '');
  if (mode === 'hash') {
    const index = hash.indexOf('?');
    path = ~index ? hash.slice(index) : '';
  }

  return new URLSearchParams(path);
};

export const createQueryString = (searchParams: URLSearchParams, mode: UrlSearchParamMode) => {
  const searchParamsString = searchParams.toString();
  const { search, hash } = window.location;

  if (mode === 'history') return `${searchParamsString ? `?${searchParamsString}` : ''}${hash}`;
  if (mode === 'hash-params') return `${search}${searchParamsString ? `#${searchParamsString}` : ''}`;
  if (mode === 'hash') {
    const index = hash.indexOf('?');
    const base = index > -1 ? hash.slice(0, index) : hash;
    return `${search}${base}${searchParamsString ? `?${searchParamsString}` : ''}`;
  }

  throw new Error('Invalid mode');
};

export const dispatchUrlSearchParamsEvent = () => window.dispatchEvent(new Event(URL_SEARCH_PARAMS_EVENT));

export interface UseUrlSearchParam {
  <Value>(
    key: string,
    options: UseUrlSearchParamOptions<Value> & { initialValue: Value },
  ): UseUrlSearchParamReturn<Value>;

  <Value>(key: string, options?: UseUrlSearchParamOptions<Value>): UseUrlSearchParamReturn<Value | undefined>;

  <Value>(key: string, initialValue: Value): UseUrlSearchParamReturn<Value>;

  <Value>(key: string): UseUrlSearchParamReturn<Value | undefined>;
}

export const useUrlSearchParam = (<Value>(key: string, params?: unknown) => {
  const options = (
    typeof params === 'object' &&
    params &&
    ('serializer' in params ||
      'deserializer' in params ||
      'initialValue' in params ||
      'mode' in params ||
      'write' in params)
      ? params
      : undefined
  ) as UseUrlSearchParamOptions<Value>;

  const initialValue = (options ? options?.initialValue : params) as Value;
  const { mode = 'history', write: writeMode = 'replace' } = options ?? {};

  const serializer = (value: Value) => {
    if (options?.serializer) return options.serializer(value);
    if (typeof value === 'string') return value;

    return JSON.stringify(value);
  };

  const deserializer = (value: string) => {
    if (options?.deserializer) return options.deserializer(value);
    if (value === 'undefined' || value === 'null') return undefined as unknown as Value;

    try {
      return JSON.parse(value) as Value;
    } catch {
      return value as Value;
    }
  };

  const setUrlSearchParam = (
    key: string,
    value: Value | undefined,
    mode: UrlSearchParamMode,
    write: 'push' | 'replace' = 'replace',
  ) => {
    const urlSearchParams = getUrlSearchParams(mode);

    if (value === undefined) {
      urlSearchParams.delete(key);
    } else {
      const serializedValue = serializer ? serializer(value) : String(value);
      urlSearchParams.set(key, serializedValue);
    }

    const query = createQueryString(urlSearchParams, mode);
    if (write === 'replace') window.history.replaceState({}, '', query);
    if (write === 'push') window.history.pushState({}, '', query);

    dispatchUrlSearchParamsEvent();
  };

  const [value, setValue] = useState<Value | undefined>(() => {
    const currentValue = getUrlSearchParams(mode).get(key);

    if (currentValue === null) return initialValue;

    return currentValue ? deserializer(currentValue) : undefined;
  });

  useEffect(() => {
    const currentValue = getUrlSearchParams(mode).get(key);

    if (currentValue === null && initialValue !== undefined) {
      setUrlSearchParam(key, initialValue, mode, writeMode);
    }
    // Начальное значение пишем в URL только при монтировании
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (value: Value, options?: UseUrlSearchParamsActionOptions) => {
    setUrlSearchParam(key, value, mode, options?.write ?? writeMode);
    setValue(value);
  };

  const remove = (options?: UseUrlSearchParamsActionOptions) => {
    setUrlSearchParam(key, undefined, mode, options?.write ?? writeMode);
    setValue(undefined);
  };

  useEffect(() => {
    const onParamsChange = () => {
      const urlSearchParams = getUrlSearchParams(mode);
      const newValue = urlSearchParams.get(key);
      setValue(newValue ? deserializer(newValue) : undefined);
    };

    window.addEventListener(URL_SEARCH_PARAMS_EVENT, onParamsChange);
    window.addEventListener('popstate', onParamsChange);
    if (mode !== 'history') {
      window.addEventListener('hashchange', onParamsChange);
    }

    return () => {
      window.removeEventListener(URL_SEARCH_PARAMS_EVENT, onParamsChange);
      window.removeEventListener('popstate', onParamsChange);
      if (mode !== 'history') {
        window.removeEventListener('hashchange', onParamsChange);
      }
    };
    // deserializer пересоздаётся на каждом рендере: с ним подписка переустанавливалась бы постоянно
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, mode]);

  return {
    value,
    remove,
    set,
  };
}) as UseUrlSearchParam;
