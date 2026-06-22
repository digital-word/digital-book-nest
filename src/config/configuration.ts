import { AppConfiguration } from './configuration.interface';

const configuration = (): AppConfiguration => ({
  env: process.env.NODE_ENV || 'develop',
  port: Number.parseInt(process.env.PORT ?? '3000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4200',
  dataPath: process.env.DATA_PATH || './data/notes.json',
  firebaseWebApiKey: process.env.WEB_API_KEY || '',
  firebaseAuthDomain: process.env.AUTH_DOMAIN || '',
  gcpProjectId: process.env.GCP_PROJECT_ID || '',
});
export default configuration;
