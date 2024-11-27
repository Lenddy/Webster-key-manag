// Importing Client model, uuid for unique IDs, and pubsub for event publishing
const Client = require("../../models/client.model");
const { v4: uuidv4 } = require("uuid");
const pubsub = require("../pubsub");

const clientResolvers = {
  Query: {
    hello: async () => {
      return "hello world";
    },
    getAllClients: async () => {
      return await Client.find()
        .then(clients => {
          console.log("all the clients", clients, "\n____________________");
          return clients;
        })
        .catch(err => {
          console.log("there was an error fetching all the clients", err, "\n____________________");
          throw err;
        });
    },
    getOneClient: async (_, { id }) => {
      return await Client.findById(id)
        .then(client => {
          console.log("one client", client, "\n____________________");
          return client;
        })
        .catch(err => {
          console.log("there was an error fetching one client", err, "\n____________________");
          throw err;
        });
    },
  },

  Mutation: {
    createOneClient: async (_, { clientName, clientLastName, cellPhones }) => {
      const createdAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();

      cellPhones = cellPhones.map(numberDate => {
        return {
          ...numberDate,
          numberId: uuidv4(),
        };
      });

      return await Client.create({
        clientName,
        clientLastName,
        cellPhones,
        createdAt,
        updatedAt,
      })
        .then(newClient => {
          pubsub.publish("CLIENT_ADDED", {
            onClientChange: {
              eventType: "CLIENT_ADDED",
              clientChanges: newClient,
            },
          });
          console.log("new client created", newClient, "\n____________________");
          return newClient;
        })
        .catch(err => {
          console.log("there was an error creating a new client", err, "\n____________________");
          throw err;
        });
    },

    updateOneClient: async (parent, args, context, info) => {
      const { id, clientName, clientLastName, cellPhones } = args;
      const update = { updatedAt: new Date().toISOString() };

      if (clientName !== undefined) {
        update.clientName = clientName;
      }
      if (clientLastName !== undefined) {
        update.clientLastName = clientLastName;
      }
      if (cellPhones !== undefined && cellPhones.length > 0) {
        const bulkOps = [];

        for (const phone of cellPhones) {
          if (phone.status === "add") {
            const newPhone = {
              numberId: uuidv4(),
              number: phone.number,
            };

            bulkOps.push({
              updateOne: {
                filter: { _id: id },
                update: {
                  $push: { cellPhones: newPhone },
                },
              },
            });
          } else if (phone.status === "update") {
            bulkOps.push({
              updateOne: {
                filter: {
                  _id: id,
                  "cellPhones.numberId": phone.numberId,
                },
                update: {
                  $set: {
                    "cellPhones.$.number": phone.number,
                  },
                },
              },
            });
          } else if (phone.status === "delete") {
            bulkOps.push({
              updateOne: {
                filter: {
                  _id: id,
                  "cellPhones.numberId": phone.numberId,
                },
                update: {
                  $pull: {
                    cellPhones: {
                      numberId: phone.numberId,
                    },
                  },
                },
              },
            });
          }
        }

        if (bulkOps.length > 0) {
          await Client.bulkWrite(bulkOps);
        }
      }

      return await Client.findByIdAndUpdate(id, update, { new: true })
        .then(updatedClient => {
          pubsub.publish("CLIENT_UPDATED", {
            onClientChange: {
              eventType: "CLIENT_UPDATED",
              clientChanges: updatedClient,
            },
          });
          console.log("client update");
          return updatedClient;
        })
        .catch(err => {
          console.log("error", err);
        });
    },

    deleteOneClient: async (_, { id }) => {
      return await Client.findByIdAndDelete(id)
        .then(deletedClient => {
          pubsub.publish("CLIENT_DELETED", {
            onClientChange: {
              eventType: "CLIENT_DELETED",
              clientChanges: deletedClient,
            },
          });
          console.log("a client was deleted", deletedClient, "\n____________________");
          return deletedClient;
        })
        .catch(err => {
          console.log("there was an error deleting a client", err, "\n____________________");
          throw err;
        });
    },
  },

  Subscription: {
    onClientChange: {
      subscribe: () => pubsub.asyncIterator([
        "CLIENT_ADDED",
        "CLIENT_UPDATED",
        "CLIENT_DELETED",
      ]),
    },
  },

  Client: {
    createdAt: client => client.createdAt.toISOString(),
    updatedAt: client => client.updatedAt.toISOString(),
  },
};

module.exports = { clientResolvers };
