const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  username: {
    type: String,
    trim: true,
    required: true,
    maxlength: 25
  },
  postID: {
    type: String,
    trim: true,
    required: true
  },
  postTitle: {
    type: String,
    trim: true,
    required: true
  },
  commentBody: {
    type: String,
    trim: true,
    required: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Comment', commentSchema);
