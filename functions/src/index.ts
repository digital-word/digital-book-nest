import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import * as functions from 'firebase-functions';
import { AppModule } from '../../src/app.module';
import {
  configureApp,
  createExpressApp,
  setupSwagger,
} from '../../src/bootstrap';
import { getApps, initializeApp } from 'firebase-admin/app';

const logger = new Logger('Functions');
const expressApp = createExpressApp();
let appInitialized: Promise<void> | undefined;

async function createApp(): Promise<void> {
  if (!getApps().length) {
    initializeApp();
  }
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  configureApp(app);
  setupSwagger(app);
  await app.init();
}

// Ensure Nest is fully initialized before any request reaches expressApp,
// instead of racing app.init() against incoming traffic on cold start.
export const api = functions.https.onRequest(async (req, res) => {
  try {
    appInitialized ??= createApp();
    await appInitialized;
  } catch (error) {
    appInitialized = undefined; // allow retry on next invocation
    logger.error(
      `Nest bootstrap failed: ${error instanceof Error ? error.stack : String(error)}`,
    );
    res.status(500).json({ statusCode: 500, message: 'Bootstrap failed' });
    return;
  }
  expressApp(req, res);
});
