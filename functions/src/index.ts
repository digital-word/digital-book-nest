import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as functions from 'firebase-functions';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/bootstrap';
import { getApps, initializeApp } from 'firebase-admin/app';

const expressApp = express();
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
    console.error('Nest bootstrap failed', error);
    res.status(500).json({ statusCode: 500, message: 'Bootstrap failed' });
    return;
  }
  expressApp(req, res);
});
