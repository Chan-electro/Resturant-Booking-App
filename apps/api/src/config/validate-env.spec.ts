import { validateEnvironment } from './validate-env';

describe('validateEnvironment', () => {
  it('allows partial configuration outside production', () => {
    expect(validateEnvironment({ NODE_ENV: 'development' })).toEqual({
      NODE_ENV: 'development',
    });
  });

  it('rejects missing production configuration', () => {
    expect(() => validateEnvironment({ NODE_ENV: 'production' })).toThrow(
      'Missing production environment variables',
    );
  });

  it('accepts a complete production configuration', () => {
    const config = {
      NODE_ENV: 'production',
      DATABASE_URL: 'postgresql://example',
      JWT_SECRET: 'a'.repeat(32),
      JWT_REFRESH_SECRET: 'b'.repeat(32),
      FRONTEND_URL: 'https://example.vercel.app',
      CLERK_SECRET_KEY: 'sk_live_example',
    };
    expect(validateEnvironment(config)).toEqual(config);
  });
});
