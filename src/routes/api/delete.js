const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');

module.exports = async (req, res) => {
  logger.debug(`Deleting: ${req.user}, ${req.params.id}`);
  const id = req.params.id.split('.')[0];
  try {
    const fragment = await Fragment.byId(req.user, id);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'Fragment Not Found'));
    }
    await Fragment.delete(req.user, id);
    res.status(200).json(createSuccessResponse());
  } catch (e) {
    res.status(500).json(createErrorResponse(500, e.message));
  }
};
