const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { resolve } = require("node:path");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! Shutting down...");
  console.log(err.name, err.message, err.stack);
  process.exit(1);
});

dotenv.config({ path: resolve(__dirname, ".env") });
const app = require("./app");

console.log(process.env.DATABASE, process.env.DATABASE_PASSWORD);

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => console.log("connected to db"));
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! Shutting down");
  console.log(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});
