import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import configuration from './config/configuration';

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
