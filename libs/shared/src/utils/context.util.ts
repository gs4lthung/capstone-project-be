import { ProtocolEnum } from '../enums/protocol.enum';

export class ContextUtils {
  static getRequestContextType(contextType: string): string {
    switch (contextType) {
      case 'http':
        return ProtocolEnum.HTTP;
      case 'graphql':
        return ProtocolEnum.GRAPHQL;
      case 'ws':
        return ProtocolEnum.WS;
      case 'wss':
        return ProtocolEnum.WSS;
      case 'tcp':
        return ProtocolEnum.TCP;
      case 'udp':
        return ProtocolEnum.UDP;
      case 'mqtt':
        return ProtocolEnum.MQTT;
      case 'amqp':
        return ProtocolEnum.AMQP;
      case 'rpc':
        return ProtocolEnum.RPC;
      case 'grpc':
        return ProtocolEnum.GRPC;
      case 'rest':
        return ProtocolEnum.REST;

      default:
        return 'unknown';
    }
  }
}
