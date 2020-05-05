const pool = require('../../pool.js');

const getRiders = (request, response) => {
  pool.query('SELECT * FROM Riders ORDER BY riderID ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getRiderById = (request, response) => {
  const riderID = parseInt(request.params.riderid);

  pool.query('SELECT * FROM Riders WHERE riderID = $1', [riderID], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createRider = (request, response) => {
  const data = {
    riderName: request.body.riderName,
    riderEmail: request.body.riderEmail,
    contactNum: request.body.contactNum,
    isOccupied: request.body.isOccupied,
    isFullTime: request.body.isFullTime,
    baseSalary: request.body.baseSalary,
  };
  const values = [data.riderName, data.riderEmail, data.isOccupied, data.contactNum, data.isFullTime, data.baseSalary];
  pool.query(
    'INSERT INTO Riders (riderName, riderEmail, isOccupied, contactNum, isFullTime, baseSalary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const updateRider = (request, response) => {
  const data = {
    riderName: request.body.riderName,
    riderEmail: request.body.riderEmail,
    contactNum: request.body.contactNum,
    isOccupied: request.body.isOccupied,
    isFullTime: request.body.isFullTime,
    baseSalary: request.body.baseSalary,
    riderID: parseInt(request.params.riderid),
  };
  const values = [
    data.riderName,
    data.riderEmail,
    data.isOccupied,
    data.contactNum,
    data.isFullTime,
    data.baseSalary,
    data.riderID,
  ];
  pool.query(
    'UPDATE Riders SET riderName = $1, riderEmail = $2, isOccupied = $3, contactNum = $4, isFullTime = $5, baseSalary = $6 WHERE riderID = $7 RETURNING *',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Rider has been updated with rider id: ${data.riderID}`);
    }
  );
};

module.exports = {
  getRiders,
  getRiderById,
  createRider,
  updateRider,
};
