
// Importing Schema and model to create the schema and saving it to the database
const { Schema, model } = require("mongoose");

const ClientSchema = new Schema(
  {
    // Attributes for the database
    clientName: {
      type: String,
      required: true,
      min: [2, "Name Of The Client Must Be At Least 2 Characters Long"],
    },

    clientLastName: {
      type: String,
      required: true,
      min: [2, "Last Name Of The Client Must Be At Least 2 Characters Long"],
    },

    cellPhones: {
      type: [
        {
          numberId: {
            type: String,
            // required: true
          },
          number: {
            type: String,
            required: true,
            validate: {
              validator: function (v) {
                // Example regex for validating US phone numbers
                return /\(\d{3}\)\d{3}-\d{4}/.test(v);
              },
              message: (props) => `${props.value} is not a valid phone number!`,
            },
          },
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

const Client = model("Clients", ClientSchema); // Naming the table(document) in the database

module.exports = Client; // Exporting the schema
