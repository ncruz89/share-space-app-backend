// custom Error object extends from Error class object
class HttpError extends Error {
  constructor(message, errorCode) {
    // initialize Error class message property and custom errorCode variable
    super(message); // add a 'message' property - must user super since error objects contain a message property.
    this.code = errorCode; //adds a 'code' property object based on errorCode
  }
}

module.exports = HttpError;
