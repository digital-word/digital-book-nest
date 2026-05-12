import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation and transformation globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable auto-transformation
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert types
      },
    }),
  );

  // Enable CORS for Angular frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Digital Book API')
    .setDescription(
      'Backend API for Digital Book platform - a comprehensive application for book enthusiasts. Currently implements the Notes feature with rich text editing using Quill Delta format.',
    )
    .setVersion('1.0')
    .addTag('notes', 'Notes management endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
void bootstrap();
