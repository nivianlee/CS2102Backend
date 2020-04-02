const pool = require('../../pool.js');

const getRestaurants = (request, response) => {
  pool.query('SELECT * FROM Restaurants ORDER BY restaurantName ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getRestaurantById = (request, response) => {
  const restaurantid = parseInt(request.params.restaurantid);

  pool.query('SELECT * FROM Restaurants WHERE restaurantID = $1', [restaurantid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getRestaurantByName = (request, response) => {
  const restaurantname = request.params.restaurantname;

  pool.query('SELECT * FROM Restaurants WHERE restaurantName = $1', [restaurantname], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

// Restaurant Location can either be an address or a postal code.
const getRestaurantByLocation = (request, response) => {
  const restaurantlocation = request.params.restaurantlocation;

  if (isNaN(restaurantlocation)) {
    pool.query('SELECT * FROM Restaurants WHERE address = $1', [restaurantlocation], (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  } else if (!isNaN(restaurantlocation)) {
    pool.query('SELECT * FROM Restaurants WHERE postalCode = $1', [restaurantlocation], (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  } else {
    throw error;
  }
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  getRestaurantByName,
  getRestaurantByLocation
};
