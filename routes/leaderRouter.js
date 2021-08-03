const express = require('express');
const bodyParser = require('body-parser');
const authenticate = require('../authenticate');
const cors = require('./cors');

const leaderRouter = express.Router();

const Leaders = require('../models/leaders');

leaderRouter.use(bodyParser.json());

leaderRouter
  .route('/')
  .options(cors.corsWithOprions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, (req, res, next) => {
    Leaders.find({})
      .then(
        (leaders) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(leaders);
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
      Leaders.create(req.body)
        .then(
          (leader) => {
            console.log('leadertion Created ', leader);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(leader);
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
      res.end('PUT operation not supported on /Leaders');
    },
  )

  .delete(
    cors.corsWithOprions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.remove({})
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

leaderRouter
  .route('/:leaderId')
  .options(cors.corsWithOprions, (req, res) => {
    res.sendStatus = 200;
  })
  .get(cors.cors, (req, res) => {
    Leaders.findById(req.params.leaderId)
      .then(
        (leader) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(leader);
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
        'POST operation not supported on /Leaders/ ' + req.params.leaderId,
      );
    },
  )

  .put(
    cors.corsWithOprions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      Leaders.findByIdAndUpdate(
        req.params.leaderId,
        { $set: req.body },
        { new: true },
      )
        .then((leader) => {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json(leader);
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
      Leaders.findByIdAndRemove(req.params.leaderId)
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

module.exports = leaderRouter;
