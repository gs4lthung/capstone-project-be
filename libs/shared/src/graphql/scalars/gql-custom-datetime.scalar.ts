import { GraphQLError, GraphQLScalarType, Kind } from 'graphql';

export const GqlCustomDateTime = new GraphQLScalarType({
  name: 'CustomDateTime',
  description:
    'A custom date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format.',

  parseValue(value: string | Date) {
    return new Date(value);
  },

  serialize(value: string | Date) {
    switch (typeof value) {
      case 'string':
        return new Date(value).toISOString();
      case 'object':
        if (value instanceof Date) {
          return value.toISOString();
        }
        throw new GraphQLError('Invalid date object');
      default:
        throw new GraphQLError('Value must be a string or Date object');
    }
  },

  parseLiteral(ast) {
    return ast.kind === Kind.STRING ? new Date(ast.value) : null;
  },
});
