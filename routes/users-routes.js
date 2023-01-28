const express = require("express");
const { check } = require("express-validator");

const fileUpload = require("../Middleware/file-upload");

const {
  getUsers,
  createUser,
  loginUser,
} = require("./../controllers/users-controller.js");

const router = express.Router();

router.get("/", getUsers); // getUsers endpoint
router.post(
  // createUser endpoint
  "/signup",
  fileUpload.single("image"), // file processor for image
  [
    check("username").not().isEmpty(), // further backend validation
    check("password").isLength({ min: 6 }),
    check("email").normalizeEmail().isEmail(),
  ],
  createUser
);
router.post("/login", loginUser); // loginUser endpoint

module.exports = router;
