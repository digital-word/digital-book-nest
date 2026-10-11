/**
 * Shapes mirroring the JSON-serialized Firebase client `User`
 * returned by POST /auth/login, so POST /auth/refresh can respond
 * with the same contract but freshly minted tokens.
 */
export interface StsTokenManager {
  refreshToken: string;
  accessToken: string;
  /** Epoch milliseconds at which the access token expires */
  expirationTime: number;
}

export interface ProviderUserData {
  providerId: string;
  uid: string;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
}

export interface RefreshedUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  isAnonymous: boolean;
  photoURL: string | null;
  providerData: ProviderUserData[];
  stsTokenManager: StsTokenManager;
  createdAt?: string;
  lastLoginAt?: string;
  apiKey?: string;
  appName?: string;
}
