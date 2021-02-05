const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: true,
    maxlength: 100
  },
  bodytext: {
    type: String,
    trim: true,
    required: true,
    maxlength: 1000
  },
  author: {
    type: String,
    maxlength: 20,
    trim: true
  },

  posted: {
    type: Date,
    default: Date.now()
  },
  category: {
    type: String,
    max: 100
  }
});

module.exports = mongoose.model('Post', postSchema);
