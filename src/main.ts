import 'reflect-metadata';
import { getApps, initializeApp } from 'firebase-admin/app';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import configuration from './config/configuration';
import { configureApp } from './bootstrap';

async function bootstrap() {
  if (!getApps().length) {
    initializeApp({ projectId: configuration().gcpProjectId });
  }

  const app = await NestFactory.create(AppModule);

  configureApp(app);

  const config = new DocumentBuilder()
    .setTitle('Digital Book API')
    .setDescription(
      'Backend API for Digital Book platform - a comprehensive application for book enthusiasts. Currently implements the Notes feature with rich text editing using Quill Delta format.',
    )
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local development')
    .addTag('notes', 'Notes management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
