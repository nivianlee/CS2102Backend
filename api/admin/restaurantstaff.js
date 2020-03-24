const pool = require('../../pool.js');

const createRestaurantStaff = (request, response) => {
  const data = {
    name: request.body.restaurantstaffname,
    restaurantid: request.body.restaurantid
  };
  const values = [data.name, data.restaurantid];
  pool.query(
    'INSERT INTO RestaurantStaff (restaurantStaffName, restaurantID) VALUES ($1, $2)',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send({ message: 'Restaurant staff has been added successfully!' });
    }
  );
};

const updateRestaurantStaff = (request, response) => {
  const data = {
    name: request.body.restaurantstaffname,
    restaurantid: request.body.restaurantid,
    restaurantstaffid: request.params.restaurantstaffid
  };
  const values = [data.name, data.restaurantid, data.restaurantstaffid];
  pool.query(
    'UPDATE RestaurantStaff SET restaurantStaffName = $1, restaurantID = $2 WHERE restaurantStaffID = $3',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send({ message: 'Restaurant staff has been updated successfully!' });
    }
  );
};

const deleteRestaurantStaff = (request, response) => {
  const restaurantstaffid = parseInt(request.params.restaurantstaffid);

  pool.query('DELETE FROM RestaurantStaff WHERE restaurantStaffID = $1', [restaurantstaffid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send({ message: 'Restaurant staff has been deleted successfully!' });
  });
};

module.exports = {
  createRestaurantStaff,
  updateRestaurantStaff,
  deleteRestaurantStaff
};
