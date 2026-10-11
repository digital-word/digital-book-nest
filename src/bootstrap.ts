import { INestApplication, ValidationPipe } from '@nestjs/common';
import express, { Application } from 'express';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import configuration from './config/configuration';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

/**
 * Mounts Swagger UI at /docs (+ /docs-json, /docs-yaml). Shared by both
 * entry points; behind the Cloud Function the path becomes /api/docs.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Digital Book API')
    .setDescription(
      'Backend API for Digital Book platform - a comprehensive application for book enthusiasts. Currently implements the Notes feature with rich text editing using Quill Delta format.',
    )
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local development')
    .addServer(
      'https://us-central1-digital-book-fbaa0.cloudfunctions.net/api',
      'Remote Staging',
    )
    .addTag('notes', 'Notes management endpoints')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, config));
}
