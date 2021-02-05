const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  username: {
    type: String,
    trim: true,
    maxlength: 25,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

// export model user with UserSchema
module.exports = mongoose.model("User", userSchema);
