const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  image: {
    type: String,
    required: true,
  },
  // wrapping places in array tells mongoose there could be more than one place per user
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
});

userSchema.plugin(uniqueValidator); // 3rd party unique validator library. Utilizes mongooses unique property to ensure no duplicates can be created
// mongooses unique property only creates an internal index to help query efficiency

module.exports = mongoose.model("User", userSchema);
