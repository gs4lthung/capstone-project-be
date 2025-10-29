export class PaginateObject<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  get nextPage(): number | null {
    return this.page < this.totalPages ? this.page + 1 : null;
  }

  get previousPage(): number | null {
    return this.page > 1 ? this.page - 1 : null;
  }

  get hasNextPage(): boolean {
    return this.page < this.totalPages;
  }

  get hasPreviousPage(): boolean {
    return this.page > 1;
  }
}
