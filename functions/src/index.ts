import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as functions from 'firebase-functions';
import { AppModule } from '../../src/app.module';

const expressApp = express();

async function createApp() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      logger: false,
    },
  );
  // Same pipes and config as main.ts
  await app.init();
}

void createApp();

export const api = functions.https.onRequest(expressApp);
