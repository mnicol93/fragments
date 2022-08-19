const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
module.exports = async (req, res) => {
  try {
    const fragment = await Fragment.byId(req.user, req.params.id);
    logger.debug(`Fragment: ${req.user}, ${req.params.id}`);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'No Fragment Found'));
    }
    res.status(200).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (e) {
    res.status(500).json(createErrorResponse(500, e.message));
  }
};
