const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("./../models/http-error.js");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (error) {
    return next(
      new HttpError("Could not retrieve users, please try again later", 500)
    );
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const createUser = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty())
    return next(
      new HttpError("Invalid inputs passed, please check your data", 422)
    );

  const { username, password, email } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (error) {
    return next(
      new HttpError("Signing up failed, please try again later", 500)
    );
  }

  if (existingUser)
    return next(
      new HttpError("Email already exists, please login instead", 422)
    );

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  const newUser = new User({
    username,
    email,
    image: req.file.path,
    password: hashedPassword,
    places: [],
  });

  try {
    await newUser.save();
  } catch (error) {
    return next(new HttpError("Sign up failed, please try again"), 500);
  }

  let token;
  try {
    token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(
      new HttpError("Signing up failed, please try again later", 500)
    );
  }

  res
    .status(201)
    .json({ userId: newUser.id, username: newUser.username, token });
};

const loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  let user;
  try {
    user = await User.findOne({ username });
  } catch (error) {
    return next(new HttpError("Log in failed, please try again later", 500));
  }

  if (!user)
    return next(new HttpError("Invalid credentials, login failed.", 403));

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, user.password);
  } catch (error) {
    return next(new HttpError("Log in failed, please try again", 500));
  }

  if (!isValidPassword)
    return next(new HttpError("Invalid credentials, login failed.", 401));

  let token;
  try {
    token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(
      new HttpError("Logging in failed, please try again later", 500)
    );
  }

  res.json({
    userId: user.id,
    username: user.username,
    token,
  });
};

exports.getUsers = getUsers;
exports.createUser = createUser;
exports.loginUser = loginUser;
