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
  const customerid = parseInt(request.params.customerid);

  pool.query('SELECT * FROM Customers WHERE customerid = $1', [customerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

// include token when creating user
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
  const customerid = parseInt(request.params.customerid);
  const data = {
    name: request.body.customerName,
    email: request.body.customerEmail,
    password: request.body.customerPassword,
    phone: request.body.customerPhone,
    address: request.body.customerAddress,
    postalCode: request.body.customerPostalCode,
    customerId: request.params.customerid
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
  const customerid = parseInt(request.params.customerid);

  pool.query('DELETE FROM Customers WHERE customerId = $1', [customerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send({ message: 'Customer has been deleted successfully!' });
  });
};

// == LOGIN AUTHENTICATION ==
// verify login details
// will change depending on how login is done (token or without token)
const verifyUser = (request, response) => {
  const email = request.body.customerEmail;
  const password = request.body.customerPassword;

  const values = [email, password];

  pool.query('SELECT * FROM Customers WHERE customerEmail = $1 and customerPassword = $2', values, (error, results) => {
    if (error) {
      throw error;
    }
    if (results.rows.length === 0) {
      // unsuccessful login
      response.status(400).send({ message: 'fail' });
    } else {
      // successful login
      response.status(200).json(results.rows);
    }
  });
};

// // == VIEW CUSTOMER PROFILE ==
// // update/remove customer details =s> updateCustomer
// // retrieve customer details w/o pass
// const getCustomerDetails = (request, response) => {
//   const customerId = parseInt(request.params.customerId);

//   pool.query(
//     'SELECT customerName, customerEmail, customerPhone, customerAddress, customerPostalCode, rewardPoints, dateCreated FROM Customers WHERE customerID = $1',
//     [customerId],
//     (error, results) => {
//       if (error) {
//         throw error;
//       }

//       response.status(200).json(results.row);
//     }
//   );
// };

// // retrieve customer additional addresses
// const getCustomerAddresses = (request, response) => {
//   const customerId = parseInt(request.param.customerId);

//   pool.query('SELECT * FROM Addresses WHERE customerID = $1', [customerId], (error, results) => {
//     if (error) {
//       throw error;
//     }

//     response.status(200).json(results.row);
//   });
// };

// // retrieve customer saved addresses
// const getCustomerAddresses = (request, response) => {
//   const customerId = parseInt(request.param.customerId);

//   pool.query(
//     'SELECT * FROM Addresses INNER JOIN SavedAddresses ON (address) WHERE customerID = $1',
//     [customerId],
//     (error, results) => {
//       if (error) {
//         throw error;
//       }

//       response.status(200).json(results.row);
//     }
//   );
// };

// // retrieve customer recent addresses
// const getCustomerAddresses = (request, response) => {
//   const customerId = parseInt(request.param.customerId);

//   pool.query(
//     'SELECT * FROM Addresses INNER JOIN RecentAddresses ON (address) WHERE customerID = $1',
//     [customerId],
//     (error, results) => {
//       if (error) {
//         throw error;
//       }

//       response.status(200).json(results.row);
//     }
//   );
// };

// // retrieve customer credit cards
// const getCustomerCreditCards = (request, response) => {
//   const customerId = parseInt(request.param.customerId);

//   pool.query('SELECT * FROM Owns WHERE customerID = $1', [customerId], (error, results) => {
//     if (error) {
//       throw error;
//     }

//     response.status(200).json(results.row);
//   });
// };

// // VIEW REVIEWS/POSTS
// const getReviewsByOrderId = (request, response) => {
//   const orderId = parseInt(request.param.orderId);

//   pool.query('SELECT * FROM Reviews WHERE OrderID = $1', [orderId], (error, results) => {
//     if (error) {
//       throw error;
//     }

//     response.status(200).json(results);
//   });
// };
const getAddresses = (request, response) => {
  const customerid = parseInt(request.params.customerid);

  pool.query(
    'SELECT distinct address, customerID FROM Addresses WHERE customerId = $1',
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
    'SELECT distinct address, customerID FROM Addresses natural join RecentAddresses WHERE customerId = $1',
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
    'SELECT distinct address, customerID FROM Addresses natural join SavedAddresses WHERE customerId = $1',
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
  verifyUser,
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAddresses,
  getRecentAddresses,
  getSavedAddresses
};
