import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

// Estrategia Passport para autenticación federada con Google OAuth 2.0
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>(
        'GOOGLE_CLIENT_ID',
        'mock-google-client-id.apps.googleusercontent.com',
      ),
      clientSecret: configService.get<string>(
        'GOOGLE_CLIENT_SECRET',
        'mock-google-client-secret',
      ),
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        'http://localhost:3000/api/auth/google/callback',
      ),
      scope: ['email', 'profile'],
    });
  }

  // Extracción del perfil verificado retornado por los servidores de Google
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;
    const user = {
      email: emails && emails.length > 0 ? emails[0].value : null,
      name:
        name && name.givenName
          ? `${name.givenName} ${name.familyName || ''}`.trim()
          : profile.displayName || 'Google User',
    };

    done(null, user);
  }
}
