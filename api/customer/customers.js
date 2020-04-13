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
        response
          .status(401)
          .send({ message: "This email or phone number is already exist!" });
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

// == LOGIN AUTHENTICATION ==
// verify login details
// will change depending on how login is done (token or without token)
const verifyUser = (request, response) => {
  const email = request.body.customerEmail;
  const password = request.body.customerPassword;

  const values = [email, password];

  pool.query(
    "SELECT * FROM Customers WHERE customerEmail = $1 and customerPassword = $2",
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows.length === 0) {
        // unsuccessful login
        response.status(400).send({ message: "fail" });
      } else {
        // successful login
        response.status(200).json(results.rows);
      }
    }
  );
};

const getAddresses = (request, response) => {
  const customerid = parseInt(request.params.customerid);

  pool.query(
    "SELECT distinct * FROM Addresses WHERE customerId = $1 ORDER BY addressTimeStamp desc limit 5",
    [customerid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const postAddress = (request, response) => {
  const data = {
    address: request.body.address,
    addressTimeStamp: new Date(),
    postalCode: request.body.postalcode,
    customerId: request.body.customerid,
  };
  const values = [
    data.address,
    data.addressTimeStamp,
    data.postalCode,
    data.customerId,
  ];

  pool.query(
    "INSERT INTO Addresses (address, addressTimeStamp, postalCode, customerID) VALUES ($1, $2, $3, $4)",
    values,
    (error, results) => {
      if (error) {
        response.status(401).send({ message: "Failed!" });
        throw error;
      }
      response
        .status(201)
        .send({ message: "Address has been added successfully!" });
    }
  );
};

const updateAddress = (request, response) => {
  const data = {
    addressid: request.body.addressid,
    address: request.body.address,
    addressTimeStamp: new Date(),
    postalcode: request.body.postalcode,
  };

  const values = [
    data.addressid,
    data.address,
    data.addressTimeStamp,
    data.postalcode,
  ];

  const query = `
  UPDATE Addresses
  SET address = $2, addressTimeStamp = $3, postalCode = $4
  WHERE addressID = $1 
  `;

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    response
      .status(200)
      .send({ message: "Address has been updated successfully!" });
  });
};

const deleteAddress = (request, response) => {
  const addressid = parseInt(request.params.addressid);

  const query = "DELETE FROM Addresses WHERE addressID = $1";

  pool.query(query, [addressid], (error, results) => {
    if (error) {
      throw error;
    }
    response
      .status(200)
      .send({ message: "Address has been deleted successfully!" });
  });
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

const getAllReviews = (request, response) => {
  pool.query("SELECT * FROM Reviews", (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getReviewsForFoodItem = (request, response) => {
  const fooditemid = parseInt(request.params.fooditemid);
  pool.query(
    "SELECT * FROM Reviews WHERE foodItemID = $1",
    [fooditemid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const postReview = (request, response) => {
  const data = {
    reviewimg: request.body.reviewimg,
    reviewmsg: request.body.reviewmsg,
    customerid: request.body.customerid,
    fooditemid: request.body.fooditemid,
  };

  const values = [
    data.reviewimg,
    data.reviewmsg,
    data.customerid,
    data.fooditemid,
  ];

  const query = `
  INSERT INTO Reviews (reviewImg, reviewMsg , customerID, foodItemID) 
  VALUES ($1, $2, $3, $4)
  `;

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    response
      .status(200)
      .send({ message: "Review has been added successfully!" });
  });
};

const updateReview = (request, response) => {
  const data = {
    reviewid: request.body.reviewid,
    reviewimg: request.body.reviewimg,
    reviewmsg: request.body.reviewmsg,
    customerid: request.body.customerid,
    fooditemid: request.body.fooditemid,
  };

  const values = [
    data.reviewid,
    data.reviewimg,
    data.reviewmsg,
    data.customerid,
    data.fooditemid,
  ];

  const query = `
  UPDATE Reviews
  SET reviewImg = $2, reviewMsg = $3
  WHERE reviewID = $1 
  AND customerID = $4
  AND foodItemID = $5
  `;

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    response
      .status(200)
      .send({ message: "Review has been updated successfully!" });
  });
};

const deleteReview = (request, response) => {
  const data = {
    reviewid: request.body.reviewid,
    customerid: request.body.customerid,
    fooditemid: request.body.fooditemid,
  };

  const values = [data.reviewid, data.customerid, data.fooditemid];

  const query = `
  DELETE FROM Reviews 
  WHERE reviewID = $1
  AND customerID = $2
  AND foodItemID = $3
  `;

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    response
      .status(200)
      .send({ message: "Review has been deleted successfully!" });
  });
};

// retrieve customer credit cards
const getCustomerCreditCards = (request, response) => {
  const customerId = parseInt(request.param.customerId);

  pool.query(
    "SELECT * FROM Owns WHERE customerID = $1",
    [customerId],
    (error, results) => {
      if (error) {
        throw error;
      }

      response.status(200).json(results.row);
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
  postAddress,
  updateAddress,
  deleteAddress,
  getCurrentOrders,
  getPastOrders,
  getAllReviews,
  getReviewsForFoodItem,
  postReview,
  updateReview,
  deleteReview,
};
