const express = require("express");
const { check } = require("express-validator");

const fileUpload = require("./../Middleware/file-upload");
const auth = require("../Middleware/auth");

const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlaceById,
  deletePlaceById,
} = require("./../controllers/places-controllers.js");

const router = express.Router();

router.get("/:pid", getPlaceById);

router.get("/user/:uid", getPlacesByUserId);

router.use(auth);

router.post(
  "/",
  fileUpload.single("image"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  updatePlaceById
);

router.delete("/:pid", deletePlaceById);

module.exports = router;
