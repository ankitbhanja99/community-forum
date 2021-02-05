const Post = require('../models/Post');
const User = require("../models/User");
const Comment = require("../models/Comment");
const passport = require('passport');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
require('dotenv').config({ path: '.env' });

// GET all posts

exports.getAll = async (req, res) => {
  try {
    const posts = await Post.find({})
      .limit(100)
      .sort({ posted: -1 });
    res.send(posts);
  } catch (error) {}
};

exports.getPost = async (req, res,) => {
  try {
    const post = await Post.find({_id: req.params.id});
    const comments = await Comment.find({postID: req.params.id})
    .sort({ commentedAt: -1 });
    res.render('post', {
      styles: ['simple-sidebar'],
      post: post[0],
      comments: comments,
      libs: ['sidebar'],
      username: req.user.username
    })
  } catch (error) {
    req.flash(
      'error_msg',
      'The post doesn\'t exist'
    );
    res.redirect('/home');
  }
};


// POST register

exports.register = (req, res) => {
  
  const {
      username,
      email,
      password,
      password2
  } = req.body;
  let errors = [];

  if (!username || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (username.length < 25) {
    errors.push({ msg: 'Username cannot exceed 25 characters' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      username,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          username,
          email,
          password,
          password2
        });
      } else {
        User.findOne({ username: username }).then(user => {
          if (user) {
            errors.push({ msg: 'Username not available! Try a different username' });
            res.render('register', {
              errors,
              email,
              password,
              password2
            });
          } else {
            const newUser = new User({
              username,
              email,
              password
            });

            bcrypt.genSalt(10, (err, salt) => {
              bcrypt.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err;
                newUser.password = hash;
                newUser
                  .save()
                  .then(user => {
                    req.flash(
                      'success_msg',
                      'You are now registered and can log in'
                    );
                    res.redirect('/login');
                  })
                  .catch(err => console.log(err));
              });
            });
          }
        });
      }
    })
  }
};


exports.login = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',  
    failureFlash: true
  })(req, res, next);
};


// POST logout

exports.logout = (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
};

// POST an update to the database

exports.postUpdate = (req, res) => {
  
  console.log(req.body);
  const {
    title,
    author,
    category,
    bodytext
  } = req.body;

  let errors = [];
  if ( !author || !title || !bodytext || !category) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (bodytext.length > 1000) {
    errors.push({ msg: 'Body text cannot exceed 1000 characters' });
  }
  
  


  if (errors.length > 0) {
    
      res.render('create', {
      errors,
      title,
      bodytext,
      styles: ['simple-sidebar'],
      libs: ['create'],
      username: req.user.username
    });
  } else {
    const newPost = new Post({
      title,
      author,
      category,
      bodytext
    });

    console.log(newPost);
    newPost.save()
    .then( posts => {
      req.flash(
        'success_msg',
        'The post was created successfully'
      );
      res.redirect('/create');
    })
    .catch(err => console.log(err));

  }
};



exports.postComment = async (req, res) => {
  
  const {
    username,
    postID,
    commentBody
  } = req.body;
  console.log(req.body);
  const post = await Post.find({_id: postID});
  const comments = await Comment.find({postID: postID})
  .sort({ commentedAt: -1 });

  let errors = [];
  if ( !username || !postID || !commentBody) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (commentBody.length > 500) {
    errors.push({ msg: 'Comment text cannot exceed 500 characters' });
  }
  
  
  if (errors.length > 0) {
    res.render('post', {
      errors,
      commentBody,
      styles: ['simple-sidebar'],
      post: post[0],
      comments: comments,
      libs: ['sidebar'],
      username: req.user.username
    });

  } else {
    const newComment = new Comment({
      username,
      postID,
      commentBody
    });

    console.log(newComment);
    newComment.save()
    .then( posts => {
      req.flash(
        'success_msg',
        'Comment Added.'
      );
      res.redirect('/post/'+postID);
    })
    .catch(err => console.log(err));

  }
};




// Middlewares for checking stuff


exports.getUser = async (req, res) => {
  try {
    // request.user is getting fetched from Middleware after token authentication
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (e) {
    res.send({ message: "Error in Fetching user" });
  }
}