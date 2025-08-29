import { ConsoleLogger } from '@nestjs/common';

export class InternalDisabledLogger extends ConsoleLogger {
  static contextsToIgnore = [
    'InstanceLoader',
    'RoutesResolver',
    'RouterExplorer',
    'NestFactory',
    'WebSocketsController',
    'GraphQLModule',
    'NestMicroservice',
    'NestApplication',
  ];

  log(...args: Parameters<ConsoleLogger['log']>): void {
    const context = args[1];
    if (!InternalDisabledLogger.contextsToIgnore.includes(context)) {
      super.log(...args);
    }
  }
}
