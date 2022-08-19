const { Fragment } = require('../../model/fragment');
const { createSuccessResponse, createErrorResponse } = require('../../response');
const logger = require('../../logger');

module.exports = async (req, res) => {
  logger.debug('POST Request: ' + req.body);

  if (!Buffer.isBuffer(req.body)) {
    return res.status(415).json(createErrorResponse(415, 'Unsupported Media Type'));
  }
  try {
    const fragment = new Fragment({ ownerId: req.user, type: req.get('Content-Type') });
    console.log(fragment);
    await fragment.save();
    await fragment.setData(req.body);

    logger.debug('New fragment created! ' + JSON.stringify(fragment));

    res.set('Content-Type', fragment.type);
    res.set('Location', `${process.env.API_URL}/v1/fragments/${fragment.id}`);
    res.status(201).json(
      createSuccessResponse({
        fragment: fragment,
      })
    );
  } catch (error) {
    console.log(error.message);
    res.status(500).json(createErrorResponse(500, error));
  }
};
