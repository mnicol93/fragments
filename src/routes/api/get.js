// src/routes/api/get.js
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

/**
 * Get a list of fragments for the current user
 */
const logger = require('../../logger');
module.exports = async (req, res) => {
  logger.debug('req.query: ' + JSON.stringify(req.query));
  let expand = req.query.expand === '1';
  try {
    const fragments = await Fragment.byUser(req.user, expand);
    res.status(200).json(
      createSuccessResponse({
        fragments: fragments,
      })
    );
  } catch (e) {
    res.status(500).json(createErrorResponse(500, e.message));
  }
};
