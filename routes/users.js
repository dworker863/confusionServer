const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const authenticate = require('../authenticate');
const cors = require('./cors');

const User = require('../models/user');

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      User.find({}).then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
      });
    },
  );

router
  .route('/signup')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .post(cors.corsWithOptions, (req, res, next) => {
    User.register(
      new User({ username: req.body.username }),
      req.body.password,
      (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err });
        } else {
          if (req.body.firstname) {
            user.firstname = req.body.firstname;
          }
          if (req.body.lastname) {
            user.lastname = req.body.lastname;
          }
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({ err });
              return;
            }
            passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ success: true, status: 'Registration Successful!' });
            });
          });
        }
      },
    );
  });

router
  .route('/login')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .post(cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      status: 'You are successfully logged in!',
      token,
    });
  });

router
  .route('/logout')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    req.logout();
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      success: true,
      status: 'You are successfully logged in!',
    });
  });

router
  .route('/facebook/token')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(passport.authenticate('facebook-token'), (req, res) => {
    if (req.user) {
      const token = authenticate.getToken({ _id: req.user._id });
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        success: true,
        status: 'You are successfully logged in!',
        token,
      });
    }
  });

module.exports = router;
