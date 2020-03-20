require("dotenv").config();
const Pool = require("pg").Pool;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

const getFDSManagers = (request, response) => {
  pool.query("SELECT * FROM FDSManagers ORDER BY managerid ASC", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getFDSManagersById = (request, response) => {
  const managerid = parseInt(request.params.managerid);

  pool.query("SELECT * FROM FDSManagers WHERE managerid = $1", [managerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createFDSManagers = (request, response) => {
  const managername = request.body.managername;
  pool.query("INSERT INTO FDSManagers (managername) VALUES ($1) RETURNING *", [managername], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Manager added with manager name: ${results.rows[0].managername}`);
  });
};

const updateFDSManagers = (request, response) => {
  const managerid = parseInt(request.params.managerid);
  const managername = request.body.managername;

  pool.query(
    "UPDATE FDSManagers SET managername = $1 WHERE managerid = $2 RETURNING *",
    [managername, managerid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Manager has been updated with manager name: ${results.rows[0].managername}`);
    }
  );
};

const deleteFDSManagers = (request, response) => {
  const managerid = parseInt(request.params.managerid);

  pool.query("DELETE FROM FDSManagers WHERE managerid = $1 RETURNING *", [managerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Manager with manager id ${results.rows[0].managerid} has been deleted`);
  });
};

module.exports = {
  getFDSManagers,
  getFDSManagersById,
  createFDSManagers,
  updateFDSManagers,
  deleteFDSManagers
};
