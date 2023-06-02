const mongoose = require("mongoose");
const DATABASE = process.env.DATABASE;

mongoose
  .connect(DATABASE, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    console.log("DataBase hasbeen connected");
  });

  // we are not useing catch here because we have handle it in unhandeled promise rejection
