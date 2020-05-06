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

const createRestaurant = (request, response) => {
  const data = {
    restaurantName: request.body.restaurantName,
    minOrderCost: request.body.minOrderCost,
    contactNum: request.body.contactNum,
    address: request.body.address,
    postalCode: request.body.postalCode,
  };
  const values = [data.restaurantName, data.minOrderCost, data.contactNum, data.address, data.postalCode];
  pool.query(
    'INSERT INTO Restaurants (restaurantName, minOrderCost, contactNum, address, postalCode) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const updateRestaurant = (request, response) => {
  const data = {
    restaurantName: request.body.restaurantName,
    minOrderCost: request.body.minOrderCost,
    contactNum: request.body.contactNum,
    address: request.body.address,
    postalCode: request.body.postalCode,
    image: request.body.image,
    restaurantID: parseInt(request.params.restaurantid),
  };
  const values = [
    data.restaurantName,
    data.minOrderCost,
    data.contactNum,
    data.address,
    data.postalCode,
    data.image,
    data.restaurantID,
  ];
  pool.query(
    'UPDATE Restaurants SET restaurantName = $1, minOrderCost = $2, contactNum = $3, address = $4, postalCode = $5, image = $6 WHERE restaurantID = $7',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Restaurant with restaurant id ${data.restaurantID} has been updated`);
    }
  );
};

const deleteRestaurant = (request, response) => {
  const restaurantID = parseInt(request.params.restaurantid);

  pool.query('DELETE FROM Restaurants WHERE restaurantID = $1 RETURNING *', [restaurantID], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Restaurant with restaurant id ${restaurantID} has been deleted`);
  });
};

module.exports = {
  getRestaurants,
  getRestaurantById,
  getRestaurantByName,
  getRestaurantByLocation,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
