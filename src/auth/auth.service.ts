import { Injectable } from '@nestjs/common';
import { signInWithEmailAndPassword, getAuth, User } from '@firebase/auth';
import { FirebaseConfigService } from '../config/firebase.config';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseConfigService: FirebaseConfigService) {
    firebaseConfigService.initializeFirebaseAdmin();
  }

  async login(email: string, password: string): Promise<User> {
    const auth = getAuth(this.firebaseConfigService.app);

    const signInResponse = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    return signInResponse.user;
  }
}
