const router = require('express').Router();
const Post = require('../models/Post');
const appController = require('../controllers/appController');
const User = require("../models/User");
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');

router.get('/home',
    ensureAuthenticated, async (req, res) => { 
    const posts = await Post.find({})
        .limit(100)
        .sort({ posted: -1 });

    res.render('home', {
        styles: ['simple-sidebar'],
        posts: posts,
        libs: ['sidebar'],
        username: req.user.username
    })
});

router.get('/',
    forwardAuthenticated,
    (req, res) => {
    res.render('welcome')
});

router.get('/dashboard',
    ensureAuthenticated,
    (req, res) => {
    res.render('dashboard', {
        username: req.user.username,
        libs: ['dashboard']
    });
});

//login handle
router.get('/login',
    forwardAuthenticated, (req,res) => {
    res.render('login')
});

router.get('/register',
    forwardAuthenticated,
    (req,res)=>{ res.render('register', {
        title: 'register'
    })
});




router.get('/trial/:id',
    (req, res) => {
    res.render('dashboard', {
        username: "ankitbhanja",
        post: appController.trialPost 
    });
});

router.get('/post/:id',
    ensureAuthenticated,
    appController.getPost 
);

// GET all posts in the runtime
router.get('/all', appController.getAll);

// register for a username
router.post(
    '/register',
    appController.register
);

router.post(
    "/login",
    appController.login
);

router.get(
    "/me",
    appController.getUser
);

router.get(
    "/create",
    ensureAuthenticated, (req, res) => {
    res.render('create', {
        styles: ['simple-sidebar'],
        libs: ['sidebar'],
        username: req.user.username
    })
});


// Logout
router.get('/logout', appController.logout);

// POST an update
// NEEDS verification
router.post(
    '/create',
    appController.postUpdate
);

router.post(
    '/comment',
    appController.postComment
);





module.exports = router;
