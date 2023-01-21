const express = require("express");
const { check } = require("express-validator");

const fileUpload = require("../Middleware/file-upload");

const {
  getUsers,
  createUser,
  loginUser,
} = require("./../controllers/users-controller.js");

const router = express.Router();

router.get("/", getUsers);
router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("username").not().isEmpty(),
    check("password").isLength({ min: 6 }),
    check("email").normalizeEmail().isEmail(),
  ],
  createUser
);
router.post("/login", loginUser);

module.exports = router;
