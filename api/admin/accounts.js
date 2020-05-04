const pool = require('../../pool.js');

const login = (request, response) => {
  const data = {
    contactNum: request.body.contactNum,
    userType: request.body.userType,
  };
  const values = [data.contactNum];
  if (data.userType === 'deliveryRider') {
    pool.query('SELECT * FROM Riders WHERE contactNum = $1', values, (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  } else if (data.userType === 'restaurantStaff') {
    pool.query('SELECT * FROM RestaurantStaff WHERE contactNum = $1', values, (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  } else {
    pool.query('SELECT * FROM FDSManagers WHERE contactNum = $1', values, (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    });
  }
};

module.exports = {
  login,
};
