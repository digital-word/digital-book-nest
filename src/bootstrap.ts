import { INestApplication, ValidationPipe } from '@nestjs/common';
import express, { Application } from 'express';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import configuration from './config/configuration';

/**
 * Creates the Express instance for functions/src/index.ts, hardened
 * immediately so no caller can wrap an unhardened instance.
 */
export function createExpressApp(): Application {
  const app = express();
  app.disable('x-powered-by'); // avoid leaking framework/version via X-Powered-By header (CWE-200)
  return app;
}

/**
 * Shared Nest app configuration used by every bootstrap entry point
 * (src/main.ts for local/dev, functions/src/index.ts for Cloud Functions).
 * Keep this the single source of truth so the two never drift apart.
 */
export function configureApp(app: INestApplication): void {
  app.useLogger(['error', 'warn', 'log', 'debug', 'verbose']);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  // .env isn't deployed with the Cloud Function, so FRONTEND_URL falls back
  // to the production frontend origin here rather than configuration()'s
  // localhost default.
  app.enableCors({
    origin: configuration().frontendUrl,
    credentials: false,
  });
}
