const path = require('path');
const logger = require('../../logger');
const { Fragment } = require('../../model/fragment');
const { createErrorResponse } = require('../../response');
module.exports = async (req, res) => {
  logger.debug(`owner id and id: ${req.user}, ${req.params.id}`);
  try {
    const fragment = await Fragment.byId(req.user, req.params.id.split('.')[0]);
    if (!fragment) {
      return res.status(404).json(createErrorResponse(404, 'No Fragment Found'));
    }
    const found = await fragment.getData();
    const extension = path.extname(req.params.id);

    if (extension) {
      const { resultdata, convertedType } = await fragment.convertType(found, extension);
      if (!resultdata) {
        return res.status(415).json(createErrorResponse(415, 'Invalid Type'));
      }

      res.set('Content-Type', convertedType);
      res.status(200).send(resultdata);
    } else {
      res.set('Content-Type', fragment.type);
      res.status(200).send(found);
    }
  } catch (e) {
    logger.warn(e.message, 'Error getting fragment by id');
    res.status(500).json(createErrorResponse(500, e.message));
  }
};
