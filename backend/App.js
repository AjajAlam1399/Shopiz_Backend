const express = require("express");
const app = express();
// importing middleware
const errorMiddleware = require("./middleware/Error");

const cors = require("cors");

const dotenv = require("dotenv");
dotenv.config({ path: "backend/config/config.env" });
// route import
const product = require("./routes/productRoute");
const user = require("./routes/UserRoute");
const order = require("./routes/OrderRoute");
const cookiparser = require("cookie-parser");
// basic devlopment mode
app.use(express.json());

// useing cookie parser to parse the cookie
app.use(cookiparser());

//cores connection
app.use(cors());

// routing
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);

// middleware for error
app.use(errorMiddleware);

module.exports = app;
