const mongoose = require("mongoose");

const userModel = mongoose.Schema({
  Username: String,
  Password:String,
  Email : String
});

module.exports = mongoose.model("userDataModel", userModel);
