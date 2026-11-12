// Матчеры toBeInTheDocument, toHaveTextContent и др. для expect из vitest
import '@testing-library/jest-dom/vitest';

import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
