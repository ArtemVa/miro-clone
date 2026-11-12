import { toast } from 'sonner';

import type { Toaster } from './types';

export const toastService: Toaster = {
  showSuccess(message) {
    toast.success(message);
  },

  showError(message) {
    toast.error(message);
  },

  showWarning(message) {
    toast.warning(message);
  },

  showInfo(message) {
    toast.info(message);
  },
};
