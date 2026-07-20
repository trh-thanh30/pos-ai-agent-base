import { registerAs } from '@nestjs/config';

// register the app config
export default registerAs('oauth', () => ({
  clientId: process.env.GOOGLE_CLIENT_ID ?? 'this_is_your_client_id',
  clientSecret:
    process.env.GOOGLE_CLIENT_SECRET ?? 'this_is_your_client_secret',
  callbackURL: process.env.GOOGLE_REDIRECT_URI ?? 'this_is_your_callback_url',
  scopes: process.env.SCOPES
    ? process.env.SCOPES.split(',')
    : ['email', 'profile'],
}));
