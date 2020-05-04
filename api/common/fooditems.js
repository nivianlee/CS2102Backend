const pool = require('../../pool.js');

const getFoodItems = (request, response) => {
  pool.query('SELECT * FROM FoodItems', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getFoodItemsByRestaurantId = (request, response) => {
  const restaurantid = parseInt(request.params.restaurantid);

  pool.query('SELECT * FROM FoodItems WHERE restaurantid = $1', [restaurantid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

module.exports = {
  getFoodItems,
  getFoodItemsByRestaurantId,
};
