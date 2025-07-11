export class CustomApiResponse<T = any> {
  constructor(
    public readonly statusCode: number,
    public readonly message: string,
    public readonly metadata?: T,
  ) {}
}
