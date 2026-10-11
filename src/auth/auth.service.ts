import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import {
  signInWithEmailAndPassword,
  getAuth,
  User,
  signOut,
} from '@firebase/auth';
import { FirebaseConfigService } from '../config/firebase.config';
import {
  ProviderUserData,
  RefreshedUser,
} from './interfaces/refreshed-user.interface';

interface SecureTokenResponse {
  access_token: string;
  expires_in: string;
  refresh_token: string;
  id_token: string;
  user_id: string;
}

interface AccountsLookupResponse {
  users?: {
    localId: string;
    email?: string;
    emailVerified?: boolean;
    displayName?: string;
    photoUrl?: string;
    createdAt?: string;
    lastLoginAt?: string;
    providerUserInfo?: {
      providerId?: string;
      rawId?: string;
      displayName?: string;
      email?: string;
      phoneNumber?: string;
      photoUrl?: string;
    }[];
  }[];
}

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

  /**
   * Exchanges a Firebase refresh token for a fresh ID token via the
   * secure token endpoint, then rebuilds the login-shaped user payload
   * with an updated stsTokenManager. Throws 401 when the refresh token
   * is invalid or revoked.
   */
  async refresh(refreshToken: string): Promise<RefreshedUser> {
    this.logger.debug('refresh called');

    const tokens = await this.exchangeRefreshToken(refreshToken);
    const expirationTime =
      Date.now() + Number.parseInt(tokens.expires_in, 10) * 1000;

    const user = await this.lookupUser(tokens.id_token);

    this.logger.log(`refresh result: uid=${user.uid}`);

    return {
      ...user,
      stsTokenManager: {
        refreshToken: tokens.refresh_token,
        accessToken: tokens.id_token,
        expirationTime,
      },
      apiKey: this.apiKey,
      appName: this.firebaseConfigService.app.name,
    };
  }

  private get apiKey(): string {
    return this.firebaseConfigService.app.options.apiKey ?? '';
  }

  /** Honors the Auth emulator when FIREBASE_AUTH_EMULATOR_HOST is set. */
  private endpointUrl(host: string, path: string): string {
    const emulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
    const base = emulatorHost
      ? `http://${emulatorHost}/${host}`
      : `https://${host}`;
    return `${base}/${path}?key=${this.apiKey}`;
  }

  private async exchangeRefreshToken(
    refreshToken: string,
  ): Promise<SecureTokenResponse> {
    const url = this.endpointUrl('securetoken.googleapis.com', 'v1/token');

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      this.logger.warn(
        `refresh failed: status=${response.status} code=${errorBody.error?.message ?? 'UNKNOWN'}`,
      );
      // 400 responses (TOKEN_EXPIRED, INVALID_REFRESH_TOKEN, USER_DISABLED,
      // USER_NOT_FOUND, ...) all mean the session can't be renewed → 401.
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return (await response.json()) as SecureTokenResponse;
  }

  private async lookupUser(
    idToken: string,
  ): Promise<Omit<RefreshedUser, 'stsTokenManager' | 'apiKey' | 'appName'>> {
    const url = this.endpointUrl(
      'identitytoolkit.googleapis.com',
      'v1/accounts:lookup',
    );

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      this.logger.warn(`accounts:lookup failed: status=${response.status}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const body = (await response.json()) as AccountsLookupResponse;
    const account = body.users?.[0];

    if (!account) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const providerData: ProviderUserData[] = (
      account.providerUserInfo ?? []
    ).map((info) => ({
      providerId: info.providerId ?? 'password',
      uid: info.rawId ?? account.localId,
      displayName: info.displayName ?? null,
      email: info.email ?? null,
      phoneNumber: info.phoneNumber ?? null,
      photoURL: info.photoUrl ?? null,
    }));

    return {
      uid: account.localId,
      email: account.email ?? null,
      emailVerified: account.emailVerified ?? false,
      displayName: account.displayName ?? null,
      isAnonymous: false,
      photoURL: account.photoUrl ?? null,
      providerData,
      createdAt: account.createdAt,
      lastLoginAt: account.lastLoginAt,
    };
  }

  async logout() {
    const auth = getAuth(this.firebaseConfigService.app);

    try {
      await signOut(auth);
      this.logger.log('Logout successful');
    } catch (error) {
      this.logger.error(`logout failed: `, error);
      throw error;
    }
  }
}
