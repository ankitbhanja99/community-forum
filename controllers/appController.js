const Post = require('../models/Post');
const User = require("../models/User");
const Comment = require("../models/Comment");
const passport = require('passport');
const bcrypt = require("bcryptjs");
require('dotenv').config({ path: '.env' });

// GET all posts

exports.getAllPosts = async (req, res) => { 
  const posts = await Post.find({})
      .limit(100)
      .sort({ createdAt: -1 });

  res.render('home', {
      title: "Home",
      small: "For All Types Of Posts",
      styles: ['simple-sidebar'],
      posts: posts,
      libs: ['sidebar'],
      username: req.user.username
  })
};


exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error_msg', 'Please log in to view that resource');
  res.redirect('/login');
};

exports.forwardAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect('/home');      
};


exports.getPost = async (req, res,) => {
  try {
    const post = await Post.find({_id: req.params.id});
    const comments = await Comment.find({postID: req.params.id})
    .sort({ createdAt: -1 });
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

exports.getCategoryPosts = async (req, res,) => {

    const posts = await Post.find({category: req.params.category})
    .limit(100)
    .sort({ createdAt: -1 });
    
    res.render('home', {
      title: req.params.category,
      small: "",
      styles: ['simple-sidebar'],
      posts: posts,
      libs: ['sidebar'],
      username: req.user.username
  })
};

exports.getUserProfile = async (req, res,) => {
  try {
    const user = await User.find({username: req.params.username});
    const posts = await Post.find({username: req.params.username})
    .sort({ createdAt: -1 });
    const comments = await Comment.find({username: req.params.username})
    .sort({ createdAt: -1 });
    res.render('userprofile', {
      styles: ['simple-sidebar'],
      user: user[0],
      posts: posts,
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
      fullname,
      email,
      username,
      password,
      password2
  } = req.body;
  const dob = new Date(req.body.dob);
  let errors = [];

  if (!fullname || !dob || !username || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (username.length > 25) {
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
      fullname,
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
          fullname,
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
              fullname,
              password,
              password2
            });
          } else {
            const newUser = new User({
              fullname,
              email,
              username,
              dob,
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
  
  const {
    title,
    // author,
    category,
    postBody
  } = req.body;
  
  const username = req.user.username;

  let errors = [];
  if ( !username || !title || !postBody || !category) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (postBody.length > 1000) {
    errors.push({ msg: 'Body text cannot exceed 1000 characters' });
  }
  
  


  if (errors.length > 0) {
    
      res.render('create', {
      errors,
      title,
      postBody,
      styles: ['simple-sidebar'],
      libs: ['create'],
      username: req.user.username
    });
  } else {
    const newPost = new Post({
      title,
      username,
      category,
      postBody
    });

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
  
  const commentBody = req.body.commentBody;
  const postTitle = req.body.postTitle;
  const postID = req.params.postID;
  const username = req.user.username;
  const post = await Post.find({_id: postID});
  const comments = await Comment.find({postID: postID})
  .sort({ createdAt: -1 });

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
      postTitle,
      commentBody
    });

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