import {
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  SelectQueryBuilder,
} from 'typeorm';
import { FilterRule } from '../enums/filter-rules.enum';
import { Sorting } from '../interfaces/sorting.interface';
import { Filtering } from '../interfaces/filtering.interface';

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
) {
  const joinedRelations = new Set<string>();

  filters.forEach((f, i) => {
    const parts = f.property.split('.');
    let currentAlias = alias;

    // Auto-join nested relations
    for (let j = 0; j < parts.length - 1; j++) {
      const relation = parts[j];
      const joinAlias = relation;
      if (!joinedRelations.has(joinAlias)) {
        qb.leftJoinAndSelect(`${currentAlias}.${relation}`, joinAlias);
        joinedRelations.add(joinAlias);
      }
      currentAlias = joinAlias;
    }

    const field = parts[parts.length - 1];
    const paramKey = `${field}_${i}`;

    switch (f.rule) {
      case FilterRule.EQUALS:
        qb.andWhere(`${currentAlias}.${field} = :${paramKey}`, {
          [paramKey]: f.value,
        });
        break;
      case FilterRule.LIKE:
        qb.andWhere(`${currentAlias}.${field} LIKE :${paramKey}`, {
          [paramKey]: `%${f.value}%`,
        });
        break;
      case FilterRule.IN:
        qb.andWhere(`${currentAlias}.${field} IN (:...${paramKey})`, {
          [paramKey]: Array.isArray(f.value)
            ? f.value
            : String(f.value).split(','),
        });
        break;
      // add other rules (gt, lt, etc.)
    }
  });

  return qb;
}
