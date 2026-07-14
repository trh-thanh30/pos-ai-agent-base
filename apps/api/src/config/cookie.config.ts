import { registerAs } from '@nestjs/config';
import type { CookieOptions } from 'express';

const isProd = process.env.NODE_ENV === 'production';
const sameSite: CookieOptions['sameSite'] = isProd ? 'none' : 'strict';

export default registerAs(
  'cookie',
  () =>
    ({
      domain: isProd ? process.env.COOKIE_DOMAIN : 'localhost',
      sameSite,
      secure: process.env.COOKIE_SECURE === 'true',
      httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
      maxAge: parseInt(process.env.COOKIE_MAX_AGE || '604800000', 10),
    }) satisfies Pick<
      CookieOptions,
      'domain' | 'sameSite' | 'secure' | 'httpOnly' | 'maxAge'
    >,
);
