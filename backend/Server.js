const app = require("./App");
const dotenv = require("dotenv");

// handeling uncaught exception
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down due to uncaugthException");
  process.exit(1);
});

//config
dotenv.config({ path: "backend/config/config.env" });

//database connection
require("./db/database");

const server = app.listen(process.env.PORT, (error) => {
  if (error) {
    console.log(`Error: ${error}`);
  } else {
    console.log(`server is working on http://localhost:${process.env.PORT}`);
  }
});

// unhandeled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err}`);
  console.log("Shutting down the server due to unhadled promise Rejection");
  server.close(() => {
    process.exit(1);
  });
});

xVN5So9RC248DI9v
