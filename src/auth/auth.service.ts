import { Injectable, Logger } from '@nestjs/common';
import { signInWithEmailAndPassword, getAuth, User } from '@firebase/auth';
import { FirebaseConfigService } from '../config/firebase.config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly firebaseConfigService: FirebaseConfigService) {}

  async login(email: string, password: string): Promise<User> {
    this.logger.debug(`login called: email=${email}`);
    const auth = getAuth(this.firebaseConfigService.app);

    try {
      const signInResponse = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      this.logger.log(`login result: uid=${signInResponse.user.uid}`);
      return signInResponse.user;
    } catch (error) {
      this.logger.error(`login failed: email=${email}`, error);
      throw error;
    }
  }
}
