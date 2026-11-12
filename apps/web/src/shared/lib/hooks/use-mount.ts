import { useEffect, type EffectCallback } from 'react';

/** Эффект один раз при монтировании. Пустой массив зависимостей здесь — суть хука */
// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMount = (effect: EffectCallback) => useEffect(effect, []);
