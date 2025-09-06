import { Filtering } from './filtering.interface';
import { Pagination } from './pagination.interface';
import { Sorting } from './sorting.interface';

export interface FindOptions {
  pagination?: Pagination;
  sort?: Sorting;
  filter?: Filtering;
}
