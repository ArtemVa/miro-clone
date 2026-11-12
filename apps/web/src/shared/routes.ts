export const ROUTES = {
  LANDING: {
    path: '/',
  },
  AUTH: {
    path: '/auth',
    LOGIN: {
      path: '/auth/login',
    },
    REGISTER: {
      path: '/auth/register',
    },
    FORGOT_PASSWORD: {
      path: '/auth/forgot-password',
    },
  },
  BOARDS: {
    path: '/boards',
  },
  BOARD: {
    path: '/board/:boardId',
    build: (boardId: string) => `/board/${boardId}`,
  },
  SETTINGS: {
    path: '/settings',
    // Секции страницы настроек: id карточки и якорь в ссылке
    SECTIONS: {
      PROFILE: 'profile',
      NOTIFICATIONS: 'notifications',
      TELEGRAM: 'telegram',
    },
    build: (section: string) => `/settings#${section}`,
  },
  NOT_FOUND: {
    path: '*',
  },
} as const;
