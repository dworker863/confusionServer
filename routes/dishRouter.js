const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const dishRouter = express.Router();

const Dishes = require('../models/dishes');

dishRouter.use(bodyParser.json());

dishRouter
  .route('/')
  .get((req, res) => {
    Dishes.find({})
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

  .post((req, res) => {
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
  })

  .put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /dishes');
  })

  .delete((req, res) => {
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
  });

dishRouter
  .route('/:dishId')
  .get((req, res) => {
    Dishes.findById(req.params.dishId)
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

  .post((req, res) => {
    res.statusCode = 403;
    res.end('POST operation not supported on /dishes/ ' + req.params.dishId);
  })

  .put((req, res) => {
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
  })

  .delete((req, res) => {
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
  });

module.exports = dishRouter;
