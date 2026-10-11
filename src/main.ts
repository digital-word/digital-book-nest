import 'reflect-metadata';
import { getApps, initializeApp } from 'firebase-admin/app';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import configuration from './config/configuration';
import { configureApp, setupSwagger } from './bootstrap';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  if (!getApps().length) {
    initializeApp({ projectId: configuration().gcpProjectId });
  }

  const app = await NestFactory.create(AppModule);

  configureApp(app);
  setupSwagger(app);

  await app.listen(process.env.PORT ?? 3000);

  const url = await app.getUrl();
  logger.log(`Application is running on: ${url}`);
  logger.log(`Swagger docs available at: ${url}/docs`);
}

void bootstrap();
