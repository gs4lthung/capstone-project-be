import { I18nResolver } from 'nestjs-i18n';
import { ExecutionContext } from '@nestjs/common';
import { ProtocolEnum } from '@app/shared/enums/protocol.enum';

export class CustomWebsocketI18nResolver implements I18nResolver {
  resolve(context: ExecutionContext): string | string[] | undefined {
    if (context.getType() !== ProtocolEnum.WS) return undefined;

    const client = context.switchToWs().getClient();

    const lang =
      client.handshake?.query?.lang ||
      client.handshake?.headers['accept-language'] ||
      'en';

    return lang;
  }
}
