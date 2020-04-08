const pool = require("../../pool.js");

const getCustomers = (request, response) => {
  pool.query("SELECT * FROM Customers", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getCustomerById = (request, response) => {
  const customerid = parseInt(request.params.customerid);

  pool.query(
    "SELECT * FROM Customers WHERE customerid = $1",
    [customerid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const createCustomer = (request, response) => {
  const data = {
    name: request.body.customerName,
    email: request.body.customerEmail,
    password: request.body.customerPassword,
    phone: request.body.customerPhone,
    address: request.body.customerAddress,
    postalCode: request.body.customerPostalCode,
    rewardPoints: 0,
    dateCreated: new Date(),
  };
  const values = [
    data.name,
    data.email,
    data.password,
    data.phone,
    data.address,
    data.postalCode,
    data.rewardPoints,
    data.dateCreated,
  ];

  pool.query(
    "INSERT INTO Customers (customerName, customerEmail,customerPassword,customerPhone,customerAddress,customerPostalCode,rewardPoints,dateCreated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    values,
    (error, results) => {
      if (error) {
        throw error;
      }

      response
        .status(201)
        .send({ message: "Customer has been added successfully!" });
    }
  );
};

const updateCustomer = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  const data = {
    name: request.body.customerName,
    email: request.body.customerEmail,
    password: request.body.customerPassword,
    phone: request.body.customerPhone,
    address: request.body.customerAddress,
    postalCode: request.body.customerPostalCode,
    customerId: request.params.customerid,
  };
  const values = [
    data.name,
    data.email,
    data.password,
    data.phone,
    data.address,
    data.postalCode,
    data.customerId,
  ];

  pool.query(
    "UPDATE Customers SET customerName = $1, customerEmail = $2, customerPassword = $3, customerPhone = $4, customerAddress = $5, customerPostalCode = $6 WHERE customerId = $7",
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response
        .status(200)
        .send({ message: "Customer has been updated successfully!" });
    }
  );
};

const deleteCustomer = (request, response) => {
  const customerid = parseInt(request.params.customerid);

  pool.query(
    "DELETE FROM Customers WHERE customerId = $1",
    [customerid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response
        .status(200)
        .send({ message: "Customer has been deleted successfully!" });
    }
  );
};

const getAddresses = (request, response) => {
  const customerid = parseInt(request.params.customerid);

  pool.query(
    "SELECT distinct address, customerID FROM Addresses WHERE customerId = $1",
    [customerid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getRecentAddresses = (request, response) => {
  const customerid = parseInt(request.params.customerid);

  pool.query(
    "SELECT distinct address, customerID FROM Addresses natural join RecentAddresses WHERE customerId = $1",
    [customerid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getSavedAddresses = (request, response) => {
  const customerid = parseInt(request.params.customerid);

  pool.query(
    "SELECT distinct address, customerID FROM Addresses natural join SavedAddresses WHERE customerId = $1",
    [customerid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getCurrentOrders = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  const query = `
  SELECT *
  FROM Requests R natural join Payments P natural join Orders O
  WHERE customerID = $1
  AND O.status = false
`;

  pool.query(query, [customerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getPastOrders = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  const query = `
  SELECT *
  FROM Requests R natural join Payments P natural join Orders O
  WHERE customerID = $1
  AND O.status = true
`;

  pool.query(query, [customerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAddresses,
  getRecentAddresses,
  getSavedAddresses,
  getCurrentOrders,
  getPastOrders,
};
