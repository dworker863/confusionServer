const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const bodyParser = require('body-parser');

const Favorites = require('../models/favorite');
const user = require('../models/user');

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.statusCode = 200;
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then((favorites) => {
        if (!favorites) {
          const err = new Error("You don't have any favorite dishes yet");
          err.status = 404;
          return next(err);
        } else {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(favorites);
        }
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then(
      (favorites) => {
        if (!favorites) {
          Favorites.create({ user: req.user._id, dishes: req.body }).then(
            (favorites) => {
              Favorites.findOne({ user: req.user._id })
                .populate('user')
                .populate('dishes')
                .then(
                  (favorites) => {
                    console.log('Favorites created', favorites);
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(favorites);
                  },
                  (err) => next(err),
                );
            },
            (err) => {
              next(err);
            },
          );
        } else {
          for (var i = 0; i < req.body.length; i++) {
            if (favorites.dishes.indexOf(req.body[i]._id) == -1) {
              favorites.dishes = [...favorites.dishes, req.body[i]._id];
            }
          }
          favorites.save().then(
            (favorites) => {
              Favorites.findOne({ user: req.user._id })
                .populate('user')
                .populate('dishes')
                .then(
                  (favorites) => {
                    res.statusCode = 200;
                    res.setHeader('Content-type', 'application/json');
                    res.json(favorites);
                  },
                  (err) => next(err),
                );
            },
            (err) => next(err),
          );
        }
      },
      (err) => next(err),
    );
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .populate('user')
      .populate('dishes')
      .then(
        (response) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(response);
        },
        (err) => next(err),
      );
  });
favoriteRouter
  .route('/:dishId')
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorites) => {
          if (!favorites) {
            Favorites.create({
              user: req.user._id,
              dishes: [req.params.dishId],
            }).then(
              (favorites) => {
                Favorites.findOne({ user: req.user._id })
                  .populate('user')
                  .populate('dishes')
                  .then(
                    (favorites) => {
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.json(favorites);
                    },
                    (err) => next(err),
                  );
              },
              (err) => next(err),
            );
          } else {
            if (favorites.dishes.indexOf(req.params.dishId) == -1) {
              favorites.dishes = [...favorites.dishes, req.params.dishId];
            }
            favorites.save().then(
              (favorites) => {
                Favorites.findOne({ user: req.user._id })
                  .populate('user')
                  .populate('dishes')
                  .then(
                    (favorites) => {
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.json(favorites);
                    },
                    (err) => next(err),
                  );
              },
              (err) => next(err),
            );
          }
        },
        (err) => next(err),
      )
      .catch((err) => next(err));
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorites) => {
          if (favorites !== null) {
            if (favorites.dishes.indexOf(req.params.dishId) == -1) {
              let err = new Error(`Dish not found`);
              err.status = 404;
              return next(err);
            } else {
              let index = favorites.dishes.indexOf(req.params.dishId);
              favorites.dishes.splice(index, 1);
              favorites.save().then(
                (favorites) => {
                  Favorites.findOne({ user: req.user._id })
                    .populate('user')
                    .populate('dishes')
                    .then(
                      (favorites) => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(favorites);
                      },
                      (err) => next(err),
                    );
                },
                (err) => next(err),
              );
            }
          } else {
            let err = new Error(`Favorites not found`);
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err),
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
