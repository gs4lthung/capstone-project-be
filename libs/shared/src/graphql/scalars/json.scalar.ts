// src/common/scalars/json.scalar.ts

import { GraphQLScalarType, Kind, ValueNode } from 'graphql';

export const JSONScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',

  // This is called when the value is sent from the server to the client
  serialize(value: any): any {
    // Just return the value directly. GraphQL will handle JSON stringification.
    return value;
  },

  // This is called when the value is sent from the client via variables
  parseValue(value: any): any {
    return value;
  },

  // This is called when the value is sent as a hard-coded literal in the query
  parseLiteral(ast: ValueNode): any {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.INT:
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.OBJECT: {
        const value = Object.create(null);
        ast.fields.forEach((field) => {
          value[field.name.value] = this.parseLiteral(field.value);
        });
        return value;
      }
      case Kind.LIST:
        return ast.values.map(this.parseLiteral);
      default:
        return null;
    }
  },
});
