const multer = require("multer"); // 3rd party middleware library to help process uploaded image files
const uuid = require("uuid").v1;

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

// file upload multer instance
// limits file size
// sets file destination on local server
// creates a random id for file name and adds proper extension
// filters what file types can be uploaded
const fileUpload = multer({
  limits: 500000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, uuid() + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type.");
    cb(error, isValid);
  },
});

module.exports = fileUpload;
