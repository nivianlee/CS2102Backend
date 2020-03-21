const pool = require('../../pool.js');

const getAllOrdersByCusId = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  pool.query(
    'SELECT * FROM Orders INNER JOIN Requests using (orderID) WHERE customerid = $1',
    [customerid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

module.exports = {
  getAllOrdersByCusId
};
