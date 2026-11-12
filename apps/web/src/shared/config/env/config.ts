import { envVariablesSchema } from './env-schema';

export const env = envVariablesSchema.parse(import.meta.env);

export const IS_DEV_MODE = import.meta.env.DEV;
