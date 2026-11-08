import { createApp } from './app';
import { createDb } from './common/db';
import { logger } from './common/logger';
import { env } from './config/env';

const db = createDb(env.DATABASE_URL);

createApp(db).listen(env.PORT, (error) => {
  if (error) {
    logger.fatal({ err: error }, 'API failed to start');
    process.exit(1);
  }
  logger.info({ port: env.PORT }, 'API listening');
});
