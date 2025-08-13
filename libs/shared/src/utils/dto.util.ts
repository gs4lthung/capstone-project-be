import { ClassConstructor, plainToInstance } from 'class-transformer';
import { parse } from 'graphql';

export class DtoUtils {
  static mapEntityToDto<Entity, Dto>(
    entity: Entity,
    dtoClass: ClassConstructor<Dto>,
  ) {
    return plainToInstance(dtoClass, entity);
  }

  static mapEntitiesToDtos<Entity, Dto>(
    entities: Entity[],
    dtoClass: ClassConstructor<Dto>,
  ) {
    return entities.map((entity) => this.mapEntityToDto(entity, dtoClass));
  }

  static getGqlArgs(gqlQuery: string, value: string): string {
    const gqlAst = parse(gqlQuery);
    const definition = gqlAst.definitions[0];
    if (
      definition.kind === 'OperationDefinition' &&
      definition.selectionSet &&
      definition.selectionSet.selections.length > 0 &&
      'arguments' in definition.selectionSet.selections[0]
    ) {
      const args = (definition.selectionSet.selections[0] as any).arguments;
      const foundArg = args.find((arg: any) => arg.name.value === value);
      const foundValue = foundArg?.value.value;
      return foundValue;
    }
    return undefined;
  }
}
