
  const { GraphQLScalarType, Kind } = require("graphql"); // Import GraphQLScalarType and Kind from graphql
  
  module.exports = {
	DateTime: new GraphQLScalarType({
	  name: "DateTime", // Name of the custom scalar
	  description: "scalar type for setting the date and the time", // Description of the scalar type
	  parseValue(val) {
		return new Date(val); // Parse the value from a request into a JavaScript Date object
	  },
	  parseLiteral(ast) {
		if (ast.kind === Kind.INT) {
		  return parseInt(ast.value, 10); // Parse integer value from a GraphQL query
		}
		return null;
	  },
	  serialize(val) {
		const date = new Date(val);
		return date.toISOString(); // Convert the Date object to ISO string format when sending as a response
	  },
	}),
  };
  