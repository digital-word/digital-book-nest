import { Injectable } from '@nestjs/common';
import { FirebaseConfigService } from './config/firebase.config';

@Injectable()
export class AppService {
  constructor(private readonly firebaseConfigService: FirebaseConfigService) {
    this.firebaseConfigService.initFirebaseApp();
  }

  getHello(): string {
    return 'Hello World!';
  }
}
