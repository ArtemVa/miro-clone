import { authHandlers } from './auth.handlers';
import { featureFlagsHandlers } from './feature-flags.handlers';

export const handlers = [...authHandlers, ...featureFlagsHandlers];
