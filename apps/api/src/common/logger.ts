import { randomUUID } from 'node:crypto';
import { pino } from 'pino';
import { pinoHttp } from 'pino-http';
import { env } from '../config/env';

// Единый логгер api. Пишет JSON в stdout, одна строка — одно событие.
// В pnpm dev вывод идёт через pino-pretty, поэтому локально он читаемый.
export const logger = pino({
  level: env.LOG_LEVEL,
  // Без pid и hostname
  base: undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  // Уровень словом ("info"), а не числом (30): так проще искать по логам
  formatters: { level: (label) => ({ level: label }) },
  // Секреты в логи не попадают. *.password закрывает поле только на один уровень вглубь:
  // { password } и { body: { password } } — да, { body: { user: { password } } } — нет.
  redact: {
    paths: [
      'password',
      '*.password',
      'headers.authorization',
      'headers.cookie',
      '*.headers.authorization',
      '*.headers.cookie',
    ],
    censor: '[Redacted]',
  },
});

// id запроса, присланный клиентом в X-Request-Id, принимаем, только если он похож на id
const REQUEST_ID = /^[\w-]{1,100}$/;

// Пишет по строке на каждый запрос и создаёт req.log — логгер, к записям которого привязан id запроса
export const httpLogger = pinoHttp({
  logger,
  // req.log добавляет к записям только reqId, а не весь запрос
  quietReqLogger: true,
  genReqId: (req, res) => {
    const header = req.headers['x-request-id'];
    const id = typeof header === 'string' && REQUEST_ID.test(header) ? header : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  autoLogging: { ignore: (req) => req.url === '/api/health' },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  serializers: {
    req: (req) => ({ method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});
