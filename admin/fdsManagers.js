require('dotenv').config();
const Pool = require('pg').Pool;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

const getFDSManagers = (request, response) => {
  pool.query('SELECT * FROM FDSManagers ORDER BY managerID ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getFDSManagerById = (request, response) => {
  const managerID = parseInt(request.params.managerID);

  pool.query('SELECT * FROM FDSManagers WHERE managerID = $1', [managerID], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createFDSManagers = (request, response) => {
  pool.query('INSERT INTO FDSManagers', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`FDSManager added with managerID: ${result.insertId}`);
  });
};

// const deleteFDSManager = (request, response) => {
//   const managerID = parseInt(request.params.managerID);

//   pool.query('DELETE FROM FDSManagers WHERE managerID = $1', [managerID], (error, results) => {
//     if (error) {
//       throw error;
//     }
//     response.status(200).send(`User deleted with managerID: ${managerID}`);
//   });
// };

module.exports = {
  getFDSManagers,
  getFDSManagerById,
  createFDSManagers
  // deleteFDSManager
};
