import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseConfigService } from '../config/firebase.config';

describe('AuthService', () => {
  let service: AuthService;
  let fetchMock: jest.Mock;

  const secureTokenResponse = {
    access_token: 'new-id-token',
    expires_in: '3600',
    refresh_token: 'new-refresh-token',
    id_token: 'new-id-token',
    user_id: 'uid-1',
  };

  const lookupResponse = {
    users: [
      {
        localId: 'uid-1',
        email: 'test1@email.com',
        emailVerified: true,
        displayName: 'Test User',
        createdAt: '1700000000000',
        lastLoginAt: '1760000000000',
        providerUserInfo: [
          {
            providerId: 'password',
            rawId: 'test1@email.com',
            email: 'test1@email.com',
          },
        ],
      },
    ],
  };

  const jsonResponse = (body: unknown, ok = true, status = 200) => ({
    ok,
    status,
    json: () => Promise.resolve(body),
  });

  beforeEach(async () => {
    fetchMock = jest.fn();
    global.fetch = fetchMock;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseConfigService,
          useValue: {
            app: { name: '[DEFAULT]', options: { apiKey: 'test-api-key' } },
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('refresh', () => {
    it('returns a login-shaped user with updated stsTokenManager', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(secureTokenResponse))
        .mockResolvedValueOnce(jsonResponse(lookupResponse));

      const before = Date.now();
      const result = await service.refresh('old-refresh-token');
      const after = Date.now();

      expect(result.uid).toBe('uid-1');
      expect(result.email).toBe('test1@email.com');
      expect(result.emailVerified).toBe(true);
      expect(result.providerData).toEqual([
        {
          providerId: 'password',
          uid: 'test1@email.com',
          displayName: null,
          email: 'test1@email.com',
          phoneNumber: null,
          photoURL: null,
        },
      ]);
      expect(result.stsTokenManager.accessToken).toBe('new-id-token');
      expect(result.stsTokenManager.refreshToken).toBe('new-refresh-token');
      expect(result.stsTokenManager.expirationTime).toBeGreaterThanOrEqual(
        before + 3600 * 1000,
      );
      expect(result.stsTokenManager.expirationTime).toBeLessThanOrEqual(
        after + 3600 * 1000,
      );
      expect(result.apiKey).toBe('test-api-key');
      expect(result.appName).toBe('[DEFAULT]');
    });

    it('calls the secure token endpoint with grant_type=refresh_token', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(secureTokenResponse))
        .mockResolvedValueOnce(jsonResponse(lookupResponse));

      await service.refresh('old-refresh-token');

      const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
      const body = (init.body as URLSearchParams).toString();
      expect(url).toBe(
        'https://securetoken.googleapis.com/v1/token?key=test-api-key',
      );
      expect(body).toContain('grant_type=refresh_token');
      expect(body).toContain('refresh_token=old-refresh-token');
    });

    it('throws UnauthorizedException when the refresh token is invalid', async () => {
      fetchMock.mockResolvedValueOnce(
        jsonResponse(
          { error: { message: 'INVALID_REFRESH_TOKEN' } },
          false,
          400,
        ),
      );

      await expect(service.refresh('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException when the user lookup fails', async () => {
      fetchMock
        .mockResolvedValueOnce(jsonResponse(secureTokenResponse))
        .mockResolvedValueOnce(jsonResponse({}, false, 400));

      await expect(service.refresh('old-refresh-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
