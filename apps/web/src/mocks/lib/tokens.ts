/**
 * Фейковые токены без подписи: base64(JSON). Только для моков!
 * Уменьшите ACCESS_TOKEN_TTL_MS (например, до 10_000), чтобы проверить refresh-флоу.
 */
const ACCESS_TOKEN_TTL_MS = 5 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const TOKEN_PREFIX = 'mock.';

type TokenType = 'access' | 'refresh';

type TokenPayload = {
  sub: string;
  type: TokenType;
  exp: number;
};

const createToken = (userId: string, type: TokenType, ttl: number) =>
  TOKEN_PREFIX + btoa(JSON.stringify({ sub: userId, type, exp: Date.now() + ttl }));

export const createAccessToken = (userId: string) => createToken(userId, 'access', ACCESS_TOKEN_TTL_MS);

export const createRefreshToken = (userId: string) => createToken(userId, 'refresh', REFRESH_TOKEN_TTL_MS);

/** Возвращает id пользователя, если токен нужного типа и не протух */
export const verifyToken = (token: string | undefined, type: TokenType): string | undefined => {
  if (!token?.startsWith(TOKEN_PREFIX)) return undefined;

  try {
    const payload = JSON.parse(atob(token.slice(TOKEN_PREFIX.length))) as Partial<TokenPayload>;

    const isValid =
      payload.type === type &&
      typeof payload.sub === 'string' &&
      typeof payload.exp === 'number' &&
      payload.exp > Date.now();

    return isValid ? payload.sub : undefined;
  } catch {
    return undefined;
  }
};

const REFRESH_TOKEN_COOKIE = 'refreshToken';

/**
 * Refresh-токен живёт в cookie, как на реальном бэкенде.
 * HttpOnly в моках невозможен: MSW кладёт cookie в document.cookie.
 */
export const refreshTokenCookie = {
  name: REFRESH_TOKEN_COOKIE,
  set: (token: string) =>
    `${REFRESH_TOKEN_COOKIE}=${token}; Path=/; Max-Age=${REFRESH_TOKEN_TTL_MS / 1000}; SameSite=Lax`,
  clear: () => `${REFRESH_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`,
};
