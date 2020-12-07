const path = require('path');
const flash = require('connect-flash');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const routes = require('./routes');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const expressEjsLayout = require('express-ejs-layouts')
require('dotenv').config({ path: '.env' });
require('./config/passport')(passport);

// HelmetJS
const helmet = require('helmet');
app.use(helmet());

// Session

app.use(
  session({
    secret: process.env.SECRET,
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      maxAge: 24*60*60*1000,
      httpOnly: true
  }
  })
);

mongoose.connect(process.env.DATABASE, {useNewUrlParser: true, useUnifiedTopology : true}, { useFindAndModify: false})
.then(() => console.log('connected to MongoDB'))
.catch('error', (err) => {
  console.log(err.message);
});


app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.set('view engine','ejs');
app.use(expressEjsLayout);

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static('static'))


app.use('/', routes);


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log('We have a server running on PORT: ' + PORT);
});
