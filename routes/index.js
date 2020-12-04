const router = require('express').Router();
const Post = require('../models/Post');
const appController = require('../controllers/appController');

router.get('/home',
    appController.ensureAuthenticated,
    appController.getAllPosts    
);

router.get('/',
    appController.forwardAuthenticated,
    (req, res) => {
    res.render('welcome')
});

router.get('/dashboard',
    appController.ensureAuthenticated,
    (req, res) => {
    res.render('dashboard', {
        username: req.user.username,
        libs: ['dashboard']
    });
});

//login handle
router.get('/login',
    appController.forwardAuthenticated, (req,res) => {
    res.render('login')
});

router.get('/register',
    appController.forwardAuthenticated, (req,res) => {
    res.render('register', {
        title: 'register',
        libs: ['register']
    })
});

router.get('/category/:category',
    appController.ensureAuthenticated,
    appController.getCategoryPosts    
);




router.get('/post/:id',
    appController.ensureAuthenticated,
    appController.getPost 
);

router.get('/user/:username',
    appController.ensureAuthenticated,
    appController.getUserProfile 
);

// GET all posts in the runtime
//router.get('/all', appController.getAll);

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
    appController.ensureAuthenticated, (req, res) => {
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
    '/comment/:postID',
    appController.postComment
);

module.exports = router;
