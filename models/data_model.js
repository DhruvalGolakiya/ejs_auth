const mongoose = require("mongoose");

const userModel = mongoose.Schema({
  name: String,
  password:String,
});

module.exports = mongoose.model("userModel", userModel);
