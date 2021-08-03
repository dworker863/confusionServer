const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const promoRouter = express.Router();

const Promotions = require('../models/promotions');

promoRouter.use(bodyParser.json());

promoRouter
  .route('/')
  .options(cors.corsWithOprions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, (req, res, next) => {
    Promotions.find({})
      .then(
        (promos) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promos);
        },
        (err) => {
          next(err);
        },
      )
      .catch((err) => {
        next(err);
      });
  })

  .post(
    cors.corsWithOprions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.create(req.body)
        .then(
          (promo) => {
            console.log('Promotion Created ', promo);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(promo);
          },
          (err) => {
            next(err);
          },
        )
        .catch((err) => {
          next(err);
        });
    },
  )

  .put(
    cors.corsWithOprions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end('PUT operation not supported on /promotions');
    },
  )

  .delete(
    cors.corsWithOprions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.remove({})
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          (err) => {
            next(err);
          },
        )
        .catch((err) => {
          next(err);
        });
    },
  );

promoRouter
  .route('/:promoId')
  .options(cors.corsWithOprions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, (req, res) => {
    Promotions.findById(req.params.promoId)
      .then(
        (promo) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promo);
        },
        (next) => {
          next(err);
        },
      )
      .catch((err) => {
        next(err);
      });
  })

  .post(
    cors.corsWithOprions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res) => {
      res.statusCode = 403;
      res.end(
        'POST operation not supported on /promotions/ ' + req.params.promoId,
      );
    },
  )

  .put(
    cors.corsWithOprions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.findByIdAndUpdate(
        req.params.promoId,
        { $set: req.body },
        { new: true },
      )
        .then((promo) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(promo);
        })
        .catch((err) => {
          next(err);
        });
    },
  )

  .delete(
    cors.corsWithOprions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Promotions.findByIdAndRemove(req.params.promoId)
        .then(
          (resp) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(resp);
          },
          (err) => {
            next(err);
          },
        )
        .catch((err) => {
          next(err);
        });
    },
  );

module.exports = promoRouter;
