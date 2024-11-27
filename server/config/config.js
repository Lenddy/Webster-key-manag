const { mongoose } = require("mongoose"); // Import mongoose for MongoDB
require("dotenv").config(); // Load environment variables from the .env file

mongoose.set("strictQuery", true); // Enable strict query mode for mongoose (only the defined fields will be saved in the schema)
mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dgnvl.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
		// Connect to MongoDB using credentials from .env (DB_USER, DB_PASS, and DB_NAME)
	)
	.then(() => console.log("Established a connection to the database")) // Success message on connection
	.catch((err) => console.log("Something went wrong when connecting to the database ", err));
// Error handling if the connection fails

// mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mern.hrxjj7q.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority
