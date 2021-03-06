const express = require('express');
const cors = require('cors');

const app = express();

const whitelist = [
  'http://localhost:3000',
  'https://localhost:3443',
  'http://localhost:3001',
  'http://localhost:3002',
];
const corsOptionsDelegate = (req, callback) => {
  let corsOptions;

  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    console.log('Allow');
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

exports.cors = cors();
exports.corsWithOptions = cors(corsOptionsDelegate);
