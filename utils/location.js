const axios = require("axios");

const HttpError = require("./../models/http-error.js");

const API_KEY = process.env.GOOGLE_API_KEY;

// get coords for address function
// receives address parameter
// calls google geocode api
// returns coordinates
async function getCoordsForAddress(address) {
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${API_KEY}`
  );

  const data = response.data;

  if (!data || data.status === "ZERO_RESULTS") {
    const error = new HttpError(
      "Could not find location for the specified address.",
      422
    );
    throw error;
  }

  const coords = data.results[0].geometry.location;

  return coords;
}

module.exports = getCoordsForAddress;
