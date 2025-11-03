import {
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { FilterRule } from '../enums/filter-rules.enum';
import { Sorting } from '../interfaces/sorting.interface';
import { Filtering } from '../interfaces/filtering.interface';
import { FindOptions } from '../interfaces/find-options.interface';
import { PaginateObject } from '../dtos/paginate.dto';

export const getOrder = (sort: Sorting) =>
  sort ? { [sort.property]: sort.direction } : {};

export const getWhere = (filters: Filtering | Filtering[]) => {
  if (!filters) return {};

  const filterArray = Array.isArray(filters) ? filters : [filters];

  return filterArray.map((filter) => {
    let value: any;

    switch (filter.rule) {
      case FilterRule.IS_NULL:
        value = IsNull();
        break;
      case FilterRule.IS_NOT_NULL:
        value = Not(IsNull());
        break;
      case FilterRule.EQUALS:
        value = filter.value;
        break;
      case FilterRule.NOT_EQUALS:
        value = Not(filter.value);
        break;
      case FilterRule.GREATER_THAN:
        value = MoreThan(filter.value);
        break;
      case FilterRule.GREATER_THAN_OR_EQUALS:
        value = MoreThanOrEqual(filter.value);
        break;
      case FilterRule.LESS_THAN:
        value = LessThan(filter.value);
        break;
      case FilterRule.LESS_THAN_OR_EQUALS:
        value = LessThanOrEqual(filter.value);
        break;
      case FilterRule.LIKE:
        value = ILike(`%${filter.value}%`);
        break;
      case FilterRule.NOT_LIKE:
        value = Not(ILike(`%${filter.value}%`));
        break;
      case FilterRule.IN:
        value = In(
          Array.isArray(filter.value)
            ? filter.value
            : String(filter.value).split(','),
        );
        break;
      case FilterRule.NOT_IN:
        value = Not(
          In(
            Array.isArray(filter.value)
              ? filter.value
              : String(filter.value).split(','),
          ),
        );
        break;
    }

    return { [filter.property]: value };
  });
};

export function applyFilters<T>(
  qb: SelectQueryBuilder<T>,
  alias: string,
  filters: Filtering[],
  joinedAliases: Set<string>,
) {
  filters.forEach((filter, idx) => {
    const parts = filter.property.split('.');

    let columnAlias: string;
    if (parts.length > 1) {
      const relationAlias = parts[0]; // e.g. role
      const column = parts[1]; // e.g. name

      // ✅ Avoid duplicate joins
      if (
        !qb.expressionMap.joinAttributes.some(
          (j) => j.alias.name === relationAlias,
        )
      ) {
        qb.leftJoinAndSelect(`${alias}.${relationAlias}`, relationAlias);
        joinedAliases.add(relationAlias);
      }

      columnAlias = `${relationAlias}.${column}`;
    } else {
      columnAlias = `${alias}.${filter.property}`;
    }

    const paramKey = `value${idx}`;
    switch (filter.rule) {
      case FilterRule.EQUALS:
        qb.andWhere(`${columnAlias} = :${paramKey}`, {
          [paramKey]: filter.value,
        });
        break;
      case FilterRule.NOT_EQUALS:
        qb.andWhere(`${columnAlias} != :${paramKey}`, {
          [paramKey]: filter.value,
        });
        break;
      case FilterRule.LIKE:
        qb.andWhere(`${columnAlias} ILIKE :${paramKey}`, {
          [paramKey]: `%${filter.value}%`,
        });
        break;
      case FilterRule.NOT_LIKE:
        qb.andWhere(`${columnAlias} NOT ILIKE :${paramKey}`, {
          [paramKey]: `%${filter.value}%`,
        });
        break;
      case FilterRule.IN:
        qb.andWhere(`${columnAlias} IN (:...${paramKey})`, {
          [paramKey]: filter.value.split(','),
        });
        break;
      case FilterRule.NOT_IN:
        qb.andWhere(`${columnAlias} NOT IN (:...${paramKey})`, {
          [paramKey]: filter.value.split(','),
        });
        break;
      case FilterRule.IS_NULL:
        qb.andWhere(`${columnAlias} IS NULL`);
        break;
      case FilterRule.IS_NOT_NULL:
        qb.andWhere(`${columnAlias} IS NOT NULL`);
        break;
      case FilterRule.GREATER_THAN:
        qb.andWhere(`${columnAlias} > :${paramKey}`, {
          [paramKey]: filter.value,
        });
        break;
      case FilterRule.GREATER_THAN_OR_EQUALS:
        qb.andWhere(`${columnAlias} >= :${paramKey}`, {
          [paramKey]: filter.value,
        });
        break;
      case FilterRule.LESS_THAN:
        qb.andWhere(`${columnAlias} < :${paramKey}`, {
          [paramKey]: filter.value,
        });
        break;
      case FilterRule.LESS_THAN_OR_EQUALS:
        qb.andWhere(`${columnAlias} <= :${paramKey}`, {
          [paramKey]: filter.value,
        });
        break;
    }
  });
}

export class BaseTypeOrmService<T> {
  constructor(protected readonly repository: Repository<T>) {}

  async find<R>(
    findOptions: FindOptions,
    alias: string,
    returnType: new (data: PaginateObject<T>) => R,
  ): Promise<R> {
    const filters = Array.isArray(findOptions.filter)
      ? findOptions.filter
      : findOptions.filter
        ? [findOptions.filter]
        : [];

    const qb: SelectQueryBuilder<T> = this.repository.createQueryBuilder(alias);

    const joinedAliases = new Set<string>();
    const { relations } = this.repository.metadata;
    relations
      .filter((r) => r.isEager)
      .forEach((r) => {
        if (!joinedAliases.has(r.propertyName)) {
          qb.leftJoinAndSelect(`${alias}.${r.propertyName}`, r.propertyName);
          joinedAliases.add(r.propertyName);
        }
      });

    if (filters.length) {
      applyFilters(qb, alias, filters, joinedAliases);
    }

    if (findOptions.sort) {
      qb.orderBy(getOrder(findOptions.sort));
    }

    qb.skip(findOptions.pagination.offset);
    qb.take(findOptions.pagination.size);

    const [items, total] = await qb.getManyAndCount();

    const page = findOptions.pagination.page;
    const pageSize = findOptions.pagination.size;

    // Some return types (like PaginatedResource(...) generated classes)
    // have a constructor that accepts a partial. Others (like PaginateObject)
    // don't — calling `new ReturnType(partial)` will ignore the partial and
    // produce an empty object. To be robust, always instantiate the class
    // then assign the paginated payload into it.
    // Use `any` here because returnType's constructor signature may require an
    // argument in the typing, but at runtime we want to call the no-arg ctor
    // and then assign properties. This is safe because we'll populate fields
    // with Object.assign immediately afterwards.
    const instance = new (returnType as any)();
    // Only assign concrete, writable fields. Computed getters (totalPages,
    // nextPage, previousPage, hasNextPage, hasPreviousPage) are read-only and
    // will throw if assigned to, so we only set the base properties.
    Object.assign(instance, {
      items,
      page,
      pageSize,
      total,
    });

    return instance;
  }
}
