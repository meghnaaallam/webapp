const express = require('express');
const router = express.Router();
const pool = require('../dbConnect/db');
const logger = require('../utils/logger');
const client = require('../utils/cloudWatch');

router.all('/healthz', async (req, res) => {
  res.header('Cache-Control', 'no-cache');

  if (req.method !== "GET") {
    logger.info(req.hostname);
    logger.info(req.path);
    logger.info(req.method);
    return res.status(405).send();
  }

  const contentLength = parseInt(req.get('Content-Length') || '0', 10);
  if (Object.keys(req.query).length > 0 || contentLength > 0) {
    logger.info(req.hostname);
    logger.info(req.path);
    logger.info(req.method);
    return res.status(400).send();
  }

  try {
    // Use pool.query instead of pool.connect
    const result = await pool.query('SELECT 1');
    logger.info(`Connected to PostgreSQL`);
    logger.info(req.hostname);
    logger.info(req.path);
    logger.info(req.method);
    client.increment("Health");
    logger.info(`Health point hit`);
    return res.status(200).send();
  } catch (error) {
    logger.error(`Error connecting to PostgreSQL:`, error);
    return res.status(503).send();
  }
});

  router.use((req, res, next) => {
    res.header('Cache-Control', 'no-cache'); 
    logger.info(req.hostname);
      logger.info(req.path);
      logger.info(req.method);
    logger.error(`Error check endpoint`);
   return res.status(404).send();
  });

  
  module.exports = router; 