const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const dishRouter = express.Router();

const Dishes = require('../models/dishes');

dishRouter.use(bodyParser.json());

dishRouter
  .route('/')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.find({})
      .populate('comments.author')
      .then(
        (dishes) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dishes);
        },
        (err) => next(err),
      )
      .catch((err) => {
        next(err);
      });
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.create(req.body)
        .then(
          (dish) => {
            console.log('Dish Created ', dish);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
          },
          (err) => next(err),
        )
        .catch((err) => {
          next(err);
        });
    },
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end('PUT operation not supported on /dishes');
    },
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      Dishes.remove({})
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          (err) => next(err),
        )
        .catch((err) => {
          next(err);
        });
    },
  );

dishRouter
  .route('/:dishId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, (req, res) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(dish);
        },
        (err) => next(err),
      )
      .catch((err) => {
        next(err);
      });
  })

  .post(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end('POST operation not supported on /dishes/ ' + req.params.dishId);
    },
  )

  .put(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      Dishes.findByIdAndUpdate(
        req.params.dishId,
        { $set: req.body },
        { new: true },
      )
        .then(
          (dish) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish);
          },
          (err) => next(err),
        )
        .catch((err) => {
          next(err);
        });
    },
  )

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      Dishes.findByIdAndRemove(req.params.dishId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          (err) => next(err),
        )
        .catch((err) => {
          next(err);
        });
    },
  );

dishRouter
  .route('/:dishId/comments')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          if (dish !== null) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments);
          } else {
            const err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err),
      )
      .catch((err) => {
        next(err);
      });
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (dish !== null) {
            req.body.author = req.user._id;
            dish.comments = [...dish.comments, req.body];
            dish.save().then(
              (dish) => {
                Dishes.findById(dish._id)
                  .populate('comments.author')
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                  });
              },
              (err) => next(err),
            );
          } else {
            const err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err),
      )
      .catch((err) => {
        next(err);
      });
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      'PUT operation not supported on /dishes' +
        req.params.dishId +
        '/comments',
    );
  })

  .delete(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Dishes.findById(req.params.dishId)
        .then(
          (dish) => {
            if (dish !== null) {
              for (let i = dish.comments.length - 1; i >= 0; i--) {
                dish.comments.id(dish.comments[i]._id).remove();
              }
              dish.save().then(
                (dish) => {
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.json(dish);
                },
                (err) => next(err),
              );
            } else {
              const err = new Error('Dish ' + req.params.dishId + ' not found');
              err.status = 404;
              return next(err);
            }
          },
          (err) => next(err),
        )
        .catch((err) => {
          next(err);
        });
    },
  );

dishRouter
  .route('/:dishId/comments/:commentId')
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .populate('comments.author')
      .then(
        (dish) => {
          if (
            dish !== null &&
            dish.comments.id(req.params.commentId) !== null
          ) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(dish.comments.id(req.params.commentId));
          } else if (dish === null) {
            const err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
          } else {
            const err = new Error(
              'Comment ' + req.params.commentId + ' not found',
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err),
      )
      .catch((err) => {
        next(err);
      });
  })

  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end(
      'POST operation not supported on /dishes/ ' +
        req.params +
        '/comments/' +
        req.params.commentId,
    );
  })

  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          if (
            dish !== null &&
            dish.comments.id(req.params.commentId) !== null
          ) {
            const comment = dish.comments.id(req.params.commentId);
            if (req.user.username === comment.author.username) {
              if (req.body.rating) {
                dish.comments.id(req.params.commentId).rating = req.body.rating;
              }
              if (req.body.comment) {
                dish.comments.id(req.params.commentId).comment =
                  req.body.comment;
              }
              dish.save().then((dish) => {
                Dishes.findById(dish._id)
                  .populate('comments.author')
                  .then((dish) => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(dish);
                  });
              });
            } else {
              let err = new Error(
                `You are not authorized to perform this operation!`,
              );
              err.status = 403;
              return next(err);
            }
          } else if (dish === null) {
            const err = new Error('Dish ' + req.params.dishId + ' not found');
            err.status = 404;
            return next(err);
          } else {
            const err = new Error(
              'Comment ' + req.params.commentId + ' not found',
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err),
      )
      .catch((err) => {
        next(err);
      });
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Dishes.findById(req.params.dishId)
      .then(
        (dish) => {
          const comment = dish.comments.id(req.params.commentId);
          if (req.user.username === comment.author.username) {
            if (dish !== null && comment) {
              comment.remove();
              dish.save().then(
                (dish) => {
                  Dishes.findById(dish._id)
                    .populate('comments.author')
                    .then((dish) => {
                      res.statusCode = 200;
                      res.setHeader('Content-Type', 'application/json');
                      res.json(dish);
                    });
                },
                (err) => next(err),
              );
            } else if (dish === null) {
              const err = new Error(`Dish ${req.params.dishId} not found`);
              err.status = 404;
              return next(err);
            } else {
              const err = new Error(
                `Comment ${req.params.commentId} not found`,
              );
              err.status = 404;
              return next(err);
            }
          } else {
            const err = new Error(
              `You are not authorized to perform this operation!`,
            );
            err.status = 403;
            return next(err);
          }
        },
        (err) => next(err),
      )
      .catch((err) => next(err));
  });

module.exports = dishRouter;
