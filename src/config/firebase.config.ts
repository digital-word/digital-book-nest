import { Injectable } from '@nestjs/common';
import { FirebaseApp, getApps, initializeApp } from '@firebase/app';
import { ConfigService } from '@nestjs/config';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
}

@Injectable()
export class FirebaseConfigService {
  public app!: FirebaseApp;
  constructor(private readonly configService: ConfigService) {}

  initializeFirebaseAdmin(): void {
    const config: FirebaseConfig = {
      apiKey: this.configService.get<string>('firebaseWebApiKey') || '',
      authDomain: this.configService.get<string>('firebaseAuthDomain') || '',
    };

    if (!getApps().length) {
      this.app = initializeApp(config);
    }
  }
}
