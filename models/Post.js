const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    maxlength: 100
  },
  postBody: {
    type: String,
    trim: true,
    required: true,
    maxlength: 10000
  },
  username: {
    type: String,
    maxlength: 20,
    trim: true,
    required: true
  },
  createdAt: {
    type: Date,
    default: () => Date.now()
  },
  category: {
    type: String,
    lowercase: true,
    required: true
  },
  edited: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Post', postSchema);
