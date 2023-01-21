const fs = require("fs");
const path = require("path");

const express = require("express");
const mongoose = require("mongoose");
// require("./db/mongoose");

const placesRoutes = require("./routes/places-routes");
const userRoutes = require("./routes/users-routes");

const HttpError = require("./models/http-error.js");

const app = express();

app.use(express.json());

// middleware to handle browser CORS policy
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/places", placesRoutes); // => /api/places/...
app.use("/api/users", userRoutes);

//middleware to handle returning static images
app.use("/uploads/images", express.static(path.join("uploads", "images")));

// default error handler for all requests that don't receive response from middleware above
app.use((req, res, next) => {
  next(new HttpError("Could not find this route.", 404));
});

// error handling middleware
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  if (res.headerSent) return next(error);

  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error has occured." });
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jutxonr.mongodb.net/${process.env.DB_NAME}`
  )
  .then(() => {
    console.log("db connected");
    app.listen(process.env.PORT || 5000);
  })
  .catch((error) => {
    console.log(error);
  });
