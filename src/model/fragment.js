// Use https://www.npmjs.com/package/nanoid to create unique IDs
const { nanoid } = require('nanoid');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const md = require('markdown-it')({
  html: true,
});
const sharp = require('sharp');
var mime = require('mime-types');
// Functions for working with fragment metadata/data using our DB
const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
  deleteFragment,
} = require('./data');

const logger = require('../logger');

const validTypes = [
  'text/plain',
  'text/markdown',
  'text/html',
  'application/json',
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

class Fragment {
  constructor({ id, ownerId, type, size = 0 }) {
    if (!ownerId) {
      throw new Error('OwnerID is required');
    }
    if (!type) {
      throw new Error('Type is required');
    }
    if (size < 0) {
      throw new Error('Size must be a positive integer');
    }
    if (!Fragment.isSupportedType(type)) {
      throw new Error('Invalid type');
    }

    this.id = id || nanoid();
    this.ownerId = ownerId;
    this.type = type;
    this.size = size;

    this.created = new Date().toISOString();
    this.updated = new Date().toISOString();
  }

  /**
   * Get all fragments (id or full) for the given user
   * @param {string} ownerId user's hashed email
   * @param {boolean} expand whether to expand ids to full fragments
   * @returns Promise<Array<Fragment>>
   */
  static async byUser(ownerId, expand = false) {
    return await listFragments(ownerId, expand);
  }

  /**
   * Gets a fragment for the user by the given id.
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise<Fragment>
   */
  static async byId(ownerId, id) {
    const newFragment = await readFragment(ownerId, id);
    if (newFragment === 'undefined') {
      throw new Error('Fragment Not Found');
    }
    return newFragment;
  }

  /**
   * Delete the user's fragment data and metadata for the given id
   * @param {string} ownerId user's hashed email
   * @param {string} id fragment's id
   * @returns Promise
   */
  static async delete(ownerId, id) {
    return await deleteFragment(ownerId, id);
  }

  /**
   * Saves the current fragment to the database
   * @returns Promise
   */
  save() {
    try {
      this.updated = new Date().toISOString();
      return writeFragment(this);
    } catch (err) {
      throw new Error('Error Saving fragments');
    }
  }

  /**
   * Gets the fragment's data from the database
   * @returns Promise<Buffer>
   */
  async getData() {
    try {
      return await readFragmentData(this.ownerId, this.id);
    } catch (err) {
      throw new Error('Error reading fragments');
    }
  }

  /**
   * Set's the fragment's data in the database
   * @param {Buffer} data
   * @returns Promise
   */
  async setData(data) {
    if (!Buffer.isBuffer(data)) {
      throw new Error('Data is not a Buffer');
    } else {
      this.size = Buffer.byteLength(data);
      this.save();
      try {
        return await writeFragmentData(this.ownerId, this.id, data);
      } catch (err) {
        throw new Error('Error setting Fragment');
      }
    }
  }

  /**
   * Returns the mime type (e.g., without encoding) for the fragment's type:
   * "text/html; charset=utf-8" -> "text/html"
   * @returns {string} fragment's mime type (without encoding)
   */
  get mimeType() {
    const { type } = contentType.parse(this.type);
    return type;
  }

  /**
   * Returns true if this fragment is a text/* mime type
   * @returns {boolean} true if fragment's type is text/*
   */
  get isText() {
    if (this.mimeType.match(/text\/+/)) {
      return true;
    }
    return false;
  }

  /**
   * Returns the formats into which this fragment type can be converted
   * @returns {Array<string>} list of supported mime types
   */
  get formats() {
    if (this.mimeType === 'text/plain') {
      return ['text/plain'];
    } else if (this.mimeType === 'text/markdown') {
      return ['text/plain', 'text/markdown', 'text/html'];
    } else if (this.mimeType === 'text/html') {
      return ['text/plain', 'text/html'];
    } else if (this.mimeType === 'application/json') {
      return ['text/plain', 'application/json'];
    } else {
      return ['image/gif', 'image/jpeg', 'image/png', 'image/webp'];
    }
  }

  /**
   * Returns true if we know how to work with this content type
   * @param {string} value a Content-Type value (e.g., 'text/plain' or 'text/plain: charset=utf-8')
   * @returns {boolean} true if we support this Content-Type (i.e., type/subtype)
   */
  static isSupportedType(value) {
    let result = validTypes.some((element) => value.includes(element));
    return result;
  }
  /**
   * Returns the data converted to the desired type
   * @param {Buffer} data fragment data to be converted
   * @param {string} extension the type extension you want to convert to (desired type)
   * @returns {Buffer} converted fragment data
   */
  async convertType(data, extension) {
    let desiredType = mime.lookup(extension);
    const formatAvailable = this.formats;

    if (!formatAvailable.includes(desiredType)) {
      logger.warn('Cant covert to this  type');
      return false;
    }

    let resultData = data;

    if (this.mimeType !== desiredType) {
      if (this.mimeType === 'text/markdown' && desiredType === 'text/html') {
        resultData = md.render(data.toString());
        resultData = Buffer.from(resultData);
      } else if (desiredType === 'image/jpeg') {
        resultData = await sharp(data).jpeg().toBuffer();
      } else if (desiredType === 'image/png') {
        resultData = await sharp(data).png().toBuffer();
      } else if (desiredType === 'image/webp') {
        resultData = await sharp(data).webp().toBuffer();
      } else if (desiredType === 'image/gif') {
        resultData = await sharp(data).gif().toBuffer();
      }
    }

    return { resultdata: resultData, convertedType: desiredType };
  }
}

module.exports.Fragment = Fragment;
