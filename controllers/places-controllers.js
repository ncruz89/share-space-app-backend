const fs = require("fs");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const getCoordsForAddress = require("./../utils/location.js");
const Place = require("../models/place");
const User = require("../models/user");

const HttpError = require("./../models/http-error.js");

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

  const { title, description, address } = req.body;

  let coords;
  try {
    coords = await getCoordsForAddress(address);
  } catch (error) {
    return next(error);
  }

  const newPlace = new Place({
    title,
    description,
    address,
    location: coords,
    image: req.file.path,
    creator: req.userData.userId,
  });

  let user;
  try {
    user = await User.findById(req.userData.userId);
  } catch (error) {
    return next(new HttpError("Creating place failed, please try again", 500));
  }

  if (!user)
    return next(new HttpError("Could not find user for provided id", 404));

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newPlace.save({ session });
    user.places.push(newPlace);
    await user.save({ session });

    await session.commitTransaction();
  } catch (error) {
    return next(new HttpError("Created place failed, please try again", 500));
  }

  res.status(201).json({ place: newPlace });
};

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    next(new HttpError("Something went wrong, could not find a place.", 500));
  }

  if (!place)
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );

  console.log("GET Request in Places");

  res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userPlaces;

  try {
    userPlaces = await Place.find({ creator: userId });
  } catch (error) {
    next(
      new HttpError("Something went wrong, could not fetch user places.", 500)
    );
  }

  // if (!userPlaces || userPlaces.length === 0)
  //   return next(new HttpError("This User does not have any places", 404));

  res.json({
    userPlaces: userPlaces.map((place) => place.toObject({ getters: true })),
  });
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );

  const { title, description } = req.body;

  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not update place", 500)
    );
  }

  if (place.creator.toString() !== req.userData.userId)
    return next(new HttpError("You are not allowed to edit this place.", 401));

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not update place.", 500)
    );
  }

  res.status(200).json({ updatedPlace: place.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;

  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete place.", 500)
    );
  }

  if (!place)
    return next(new HttpError("Could not find place for this id.", 404));

  if (place.creator.id !== req.userData.userId)
    return next(
      new HttpError("You are not allowed to delete this place.", 401)
    );

  const imagePath = place.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await place.remove({ session });
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await session.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, could not delete place", 500)
    );
  }

  fs.unlink(imagePath, (error) => console.log(error));

  res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
