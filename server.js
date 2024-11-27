const express = require("express"); // Import Express for server setup
const { Server } = require("socket.io"); // Import Socket.IO for real-time communication
const { ApolloServer } = require("apollo-server-express"); // Import ApolloServer for GraphQL API //! deprecated use @apollo/server
const { createServer } = require("http"); // Import createServer to create an HTTP server
const { SubscriptionServer } = require("subscriptions-transport-ws"); // Import SubscriptionServer for WebSocket handling //! deprecated use graphql-ws
const { execute, subscribe } = require("graphql"); // Import execute and subscribe from GraphQL

const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge"); // Import utilities to merge typeDefs and resolvers
const { makeExecutableSchema } = require("@graphql-tools/schema"); // Import schema creation utility from GraphQL tools
require("dotenv").config(); // Load environment variables from the .env file

// Import type definitions and resolvers for different entities
const { clientTypeDef } = require("./server/graphql/types/client.typeDef");
const { clientResolvers } = require("./server/graphql/resolvers/client.resolver");
/*const { vehicleTypeDef } = require("./server/graphql/types/vehicle.typeDef");
  const { vehicleResolvers } = require("./server/graphql/resolvers/vehicle.resolver");
  const { dealTypeDef } = require("./server/graphql/types/deal.typeDef");
  const { dealResolvers } = require("./server/graphql/resolvers/deal.resolver");
  */
// Merge all type definitions and resolvers into single objects
const mergedTypeDefs = mergeTypeDefs([clientTypeDef]); // Combine type definitions
const mergedResolvers = mergeResolvers([clientResolvers]); // Combine resolvers

// Create a GraphQL schema using the merged type definitions and resolvers
const schema = makeExecutableSchema({
	typeDefs: mergedTypeDefs,
	resolvers: mergedResolvers,
});

const startServer = async () => {
	const app = express(); // Initialize Express app
	const httpServer = createServer(app); // Create an HTTP server for the Express app

	const apolloServer = new ApolloServer({
		schema, // Set the merged GraphQL schema for ApolloServer
	});

	await apolloServer.start(); // Start ApolloServer

	apolloServer.applyMiddleware({ app }); // Attach ApolloServer to the Express app

	const subscriptionServer = await SubscriptionServer.create(
		{
			schema, // Set the schema for GraphQL subscriptions
			execute, // Use the execute function from GraphQL
			subscribe, // Use the subscribe function from GraphQL
		},
		{
			server: httpServer, // Attach the WebSocket subscription server to the HTTP server
			path: apolloServer.graphqlPath, // Set the GraphQL path for WebSocket subscriptions
		}
	);

	await require("./server/config/config"); // Establish a connection to the MongoDB database

	const PORT = process.env.PORT || 4000; // Use the port from .env or default to 4000
	httpServer.listen(
		PORT,
		() => console.log(`Server is now running on http://localhost:${PORT}/graphql`) // Log the server URL
	);
};

startServer(); // Run the server startup function
