const pool = require('../../pool.js');

const getCustomers = (request, response) => {
  pool.query('SELECT * FROM Customers', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getCustomerById = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('SELECT * FROM Customers WHERE customerid = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
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
    dateCreated: new Date()
  };
  const values = [
    data.name,
    data.email,
    data.password,
    data.phone,
    data.address,
    data.postalCode,
    data.rewardPoints,
    data.dateCreated
  ];
  //console.log(values);
  pool.query(
    'INSERT INTO Customers (customerName, customerEmail,customerPassword,customerPhone,customerAddress,customerPostalCode,rewardPoints,dateCreated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(201).send({ message: 'Customer has been added successfully!' });
    }
  );
};

const updateCustomer = (request, response) => {
  const id = parseInt(request.params.id);
  const data = {
    name: request.body.customerName,
    email: request.body.customerEmail,
    password: request.body.customerPassword,
    phone: request.body.customerPhone,
    address: request.body.customerAddress,
    postalCode: request.body.customerPostalCode,
    customerId: request.params.id
  };
  const values = [data.name, data.email, data.password, data.phone, data.address, data.postalCode, data.customerId];
  console.log(values);
  pool.query(
    'UPDATE Customers SET customerName = $1, customerEmail = $2, customerPassword = $3, customerPhone = $4, customerAddress = $5, customerPostalCode = $6 WHERE customerId = $7',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send({ message: 'Customer has been updated successfully!' });
    }
  );
};

const deleteCustomer = (request, response) => {
  const id = parseInt(request.params.id);

  pool.query('DELETE FROM Customers WHERE customerId = $1', [id], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send({ message: 'Customer has been deleted successfully!' });
  });
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
