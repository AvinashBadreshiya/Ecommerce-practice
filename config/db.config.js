const mongoose = require("mongoose");
const debugDb = require("debug")("db");
const { createSuperadmin } = require("../controllers/user/user.controller")

mongoose
  .connect(process.env.MONGO_URI)
  .then(async() => {
    debugDb("🎯 connected");
    await createSuperadmin.handler()
  })
  .catch((err) => {
    debugDb(err);
  });
