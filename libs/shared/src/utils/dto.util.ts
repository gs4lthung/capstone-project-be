import { ClassConstructor, plainToInstance } from 'class-transformer';

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
}
