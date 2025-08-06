import { ConfigService } from '@app/config';
import { GoogleUserDto } from '@app/shared/dtos/auth/google-user.dto';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    const googleConfig = configService.get('google').oauth;
    const callbackUrl = `${configService.get('api_gateway').host === 'localhost' ? 'http' : 'https'}://${configService.get('api_gateway').host}:${configService.get('api_gateway').port}/api/v1/auth/google-redirect`;
    super({
      clientID: googleConfig.clientId,
      clientSecret: googleConfig.clientSecret,
      callbackURL: callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user = {
      id: profile.id,
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    } as GoogleUserDto;

    done(null, user);
  }
}
