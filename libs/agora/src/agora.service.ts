import { ConfigService } from '@app/config';
import { Injectable } from '@nestjs/common';
import { RtcTokenBuilder, RtcRole } from 'agora-token';

@Injectable()
export class AgoraService {
  private appId: string;
  private appCertificate: string;
  constructor(private readonly configService: ConfigService) {
    this.appId = this.configService.get('agora').appId;
    this.appCertificate = this.configService.get('agora').appCertificate;
  }

  generateRtcToken(
    channelName: string,
    uid: string | number,
    role: 'publisher' | 'subscriber',
    tokenExpireInSeconds = 3600,
  ): string {
    const privilegeExpire =
      Math.floor(Date.now() / 1000) + tokenExpireInSeconds;
    return RtcTokenBuilder.buildTokenWithUid(
      this.appId,
      this.appCertificate,
      channelName,
      uid,
      role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER,
      tokenExpireInSeconds,
      privilegeExpire,
    );
  }
}
