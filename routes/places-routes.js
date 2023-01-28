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

router.get("/:pid", getPlaceById); // get place by id endpoint

router.get("/user/:uid", getPlacesByUserId); // get places by userID endpoint

router.use(auth); // requiring auth for following endpoints

// createPlace endpoint
router.post(
  "/",
  fileUpload.single("image"), // file processor for image
  [
    check("title").not().isEmpty(), // further backend validation
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
  ],
  createPlace
);

// update Place By Id endpoint
router.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })], // further backend validation
  updatePlaceById
);

router.delete("/:pid", deletePlaceById); // delete place by id endpoint

module.exports = router;
