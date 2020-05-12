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
    dateCreated: new Date(),
  };
  const values = [
    data.name,
    data.email,
    data.password,
    data.phone,
    data.rewardPoints,
    data.dateCreated,
    data.address,
    data.postalCode,
  ];

  pool.query('SELECT add_customer_and_address($1, $2, $3, $4, $5, $6, $7, $8)', values, (error, results) => {
    if (error) {
      response.status(401).send({ message: 'This email or phone number is already exist!' });
      throw error;
    }
    response.status(201).send({ message: 'Customer has been added successfully!' });
  });
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
  const values = [data.name, data.email, data.password, data.phone, data.address, data.postalCode, data.customerId];

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

const getAddresses = (request, response) => {
  const customerid = parseInt(request.params.customerid);

  pool.query(
    'SELECT distinct * FROM Addresses WHERE customerId = $1 ORDER BY addressTimeStamp desc limit 5',
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
  const values = [data.address, data.addressTimeStamp, data.postalCode, data.customerId];

  pool.query(
    'INSERT INTO Addresses (address, addressTimeStamp, postalCode, customerID) VALUES ($1, $2, $3, $4)',
    values,
    (error, results) => {
      if (error) {
        response.status(401).send({ message: 'Failed!' });
        throw error;
      }
      response.status(201).send({ message: 'Address has been added successfully!' });
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

  const values = [data.addressid, data.address, data.addressTimeStamp, data.postalcode];

  const query = `
  UPDATE Addresses
  SET address = $2, addressTimeStamp = $3, postalCode = $4
  WHERE addressID = $1 
  `;

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send({ message: 'Address has been updated successfully!' });
  });
};

const deleteAddress = (request, response) => {
  const addressid = parseInt(request.params.addressid);

  const query = 'DELETE FROM Addresses WHERE addressID = $1';

  pool.query(query, [addressid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send({ message: 'Address has been deleted successfully!' });
  });
};

const getCurrentOrders = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  const query = `
  SELECT *
  FROM Requests R 
  natural join Orders O 
  natural join Contains C 
  natural join FoodItems F
  inner join Restaurants Res on (Res.restaurantID = F.restaurantID) 
  inner join DeliveryFee D on (O.deliveryID = D.deliveryID)
  inner join OrderCosts OC on (O.orderid = OC.orderid)
  inner join Payments P on (P.paymentID = R.paymentID)
  inner join Riders Rd USING (riderID)
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
  ORDER BY orderPlacedTimeStamp desc
`;
  pool.query(query, [customerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getPastOrdersWithRes = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  const query = `
  SELECT distinct O.orderID, O.riderID, Res.restaurantID, Res.restaurantname, Res.contactnum, Res.address, O.deliveryaddress, O.riderdeliverordertimestamp, O.orderPlacedTimeStamp, D.deliveryFeeAmount, sum(quantity*price) as TotalCost
  FROM Requests R natural join Orders O natural join Contains C natural join FoodItems F inner join Restaurants Res on (Res.restaurantID = F.restaurantID) inner join DeliveryFee D on (O.deliveryID = D.deliveryID)
  WHERE customerID = $1
  AND O.status = true
  GROUP BY O.orderID, O.riderID, Res.restaurantID, Res.restaurantname, Res.contactnum, Res.address, O.deliveryaddress, O.riderdeliverordertimestamp, D.deliveryFeeAmount
  ORDER BY O.orderPlacedTimeStamp desc
`;
  pool.query(query, [customerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getAnOrderByCusIdNOrderId = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  const orderid = parseInt(request.params.orderid);
  const query = `
  SELECT *
  FROM Requests R natural join Contains C natural join FoodItems F natural join Orders O
  WHERE customerID = $1
  AND orderID = $2
`;
  pool.query(query, [customerid, orderid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getAllReviews = (request, response) => {
  pool.query('SELECT * FROM Reviews', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getReviewsForFoodItem = (request, response) => {
  const fooditemid = parseInt(request.params.fooditemid);
  pool.query('SELECT * FROM Reviews WHERE foodItemID = $1', [fooditemid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getReviewForFoodItemByOrderId = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  const fooditemid = parseInt(request.params.fooditemid);

  pool.query(
    'SELECT * FROM Reviews WHERE foodItemID = $1 AND customerID = $2',
    [fooditemid, customerid],
    (error, results) => {
      if (error) {
        response.status(400).send(error);
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const getFoodItemReviewsByRestaurantID = (request, response) => {
  const restaurantid = parseInt(request.params.restaurantid);
  const query = `
    SELECT R.reviewID, R.reviewImg, R.reviewMsg, R.customerID, R.foodItemID, F.restaurantID
    FROM Reviews R JOIN FoodItems F USING (foodItemID)
    WHERE F.restaurantID = $1
    ORDER BY R.reviewID
  `;

  pool.query(query, [restaurantid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const postReview = (request, response) => {
  const data = {
    reviewimg: request.body.reviewimg,
    reviewmsg: request.body.reviewmsg,
    customerid: request.body.customerid,
    fooditemid: request.body.fooditemid,
  };

  const values = [data.reviewimg, data.reviewmsg, data.customerid, data.fooditemid];

  const query = `
  INSERT INTO Reviews (reviewImg, reviewMsg , customerID, foodItemID) 
  VALUES ($1, $2, $3, $4)
  `;

  pool.query(query, values, (error, results) => {
    if (error) {
      response.status(400).send(error);
      throw error;
    }
    response.status(201).send({ message: 'Review has been added successfully!' });
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

  const values = [data.reviewid, data.reviewimg, data.reviewmsg, data.customerid, data.fooditemid];

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
    response.status(200).send({ message: 'Review has been updated successfully!' });
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
    response.status(200).send({ message: 'Review has been deleted successfully!' });
  });
};

const getCustomerCreditCards = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  pool.query('SELECT * FROM CreditCards WHERE customerid = $1', [customerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getCustomerCreditCard = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  const creditCardId = parseInt(request.params.creditcardid);
  pool.query(
    'SELECT * FROM CreditCards WHERE customerid = $1 AND creditCardNumber = $2',
    [customerid, creditCardId],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const addCustomerCreditCard = (request, response) => {
  const data = {
    customerid: request.body.customerid,
    creditcardnumber: request.body.creditcardnumber,
    creditcardname: request.body.creditcardname,
    expirymonth: request.body.expirymonth,
    expiryyear: request.body.expiryyear,
  };

  const values = [data.customerid, data.creditcardnumber, data.creditcardname, data.expirymonth, data.expiryyear];

  const query = `
  INSERT INTO CreditCards (customerID, creditCardNumber, creditCardName, expiryMonth, expiryYear) 
  VALUES ($1, $2, $3, $4, $5)
  `;

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send({ message: 'Credit card has been added successfully!' });
  });
};

const updateCustomerCreditCard = (request, response) => {
  const data = {
    customerid: request.body.customerid,
    creditcardnumber: request.body.creditcardnumber,
    creditcardname: request.body.creditcardname,
    expirymonth: request.body.expirymonth,
    expiryyear: request.body.expiryyear,
    oldcreditcardnumber: request.body.oldcreditcardnumber,
  };

  const values = [
    data.customerid,
    data.creditcardnumber,
    data.creditcardname,
    data.expirymonth,
    data.expiryyear,
    data.oldcreditcardnumber,
  ];

  const query = `
  UPDATE CreditCards
  SET creditCardNumber = $2, creditCardName = $3, expiryMonth = $4, expiryYear = $5
  WHERE customerID = $1 
  AND creditCardNumber = $6
  `;

  pool.query(query, values, (error, results) => {
    if (error) {
      response.status(201).send({ message: error });
    }
    response.status(200).send({ message: 'Credit card has been updated successfully!' });
  });
};

const deleteCustomerCreditCard = (request, response) => {
  const data = {
    customerid: request.body.customerid,
    creditcardnumber: request.body.creditcardnumber,
  };

  const values = [data.customerid, data.creditcardnumber];
  const query = `
  DELETE FROM CreditCards 
  WHERE customerID = $1
  AND creditCardNumber = $2
  `;

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send({ message: 'Credit card has been deleted successfully!' });
  });
};

const rateRider = (request, response) => {
  const customerid = parseInt(request.params.customerid);

  const data = {
    orderid: request.body.orderid,
    riderid: request.body.riderid,
    rating: request.body.rating,
  };
  const values = [customerid, data.riderid, data.orderid, data.rating];

  const query = `
    INSERT INTO Rates (customerID, riderID, orderID, rating)
    VALUES($1, $2, $3, $4)
  `;

  pool.query(query, values, (error, results) => {
    if (error) {
      response.status(401).send({ message: 'Failed!' });
      throw error;
    }
    response.status(201).send({ message: 'Rider has been rated successfully!' });
  });
};

const getRiderRating = (request, response) => {
  const customerid = parseInt(request.params.customerid);
  const orderid = parseInt(request.params.orderid);

  const query = `
    SELECT * FROM  Rates 
    WHERE customerID = $1
    AND orderID = $2
  `;

  pool.query(query, [customerid, orderid], (error, results) => {
    if (error) {
      response.status(401).send({ message: 'Failed!' });
      throw error;
    }
    response.status(201).send(results.rows);
  });
};

const postOrder = (request, response) => {
  // Adding of Address & Credit cards are handled on FE

  const data = {
    customerid: request.body.customerid,
    address: request.body.deliveryaddress,
    ordertimestamp: new Date(),
    fooditems: request.body.fooditems,
    specialrequest: request.body.specialrequest,
    userewardpoints: request.body.userewardpoints,
    rewardpoints: request.body.rewardpoints,
    usecash: request.body.usecash,
    usecreditcard: request.body.usecreditcard,
    creditcardnum: request.body.creditcardnumber,
    orderstatue: false,
    promotionid: request.body.promotionid,
  };
  // console.log(data);

  let deliveryid = 0;
  let totalQty = 0;
  const fooditems = data.fooditems;

  // Determine Delivery Fee
  for (var i = 0; i < fooditems.length; i++) {
    totalQty += fooditems[i].quantity;

    if (totalQty < 10) {
      deliveryid = 1;
    } else if (totalQty >= 10 && totalQty <= 15) {
      deliveryid = 2;
    } else {
      deliveryid = 3;
    }
  }

  const promotionId = data.promotionid;

  (async () => {
    // note: we don't try/catch this because if connecting throws an exception
    // we don't need to dispose of the client (it will be undefined)
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      // Randomly select rider who is free
      const getRiderId = `SELECT riderID FROM Riders WHERE isOccupied = false LIMIT 1`;
      const riderid = await client.query(getRiderId);

      const orderValues = [
        data.orderstatue,
        data.ordertimestamp,
        data.specialrequest,
        data.address,
        riderid.rows[0].riderid,
        deliveryid,
      ];
      // Create Order & Return ID
      const queryText =
        'INSERT INTO Orders(status, orderPlacedTimeStamp, specialRequest, deliveryAddress, riderID, deliveryID) VALUES ($1, $2, $3, $4, $5, $6) RETURNING orderid';
      const res = await client.query(queryText, orderValues);

      // Create Payments
      const insertPayment =
        'INSERT INTO Payments(orderID, creditCardNumber, useCash, useCreditCard, useRewardPoints) VALUES ($1, $2, $3, $4, $5) RETURNING paymentid';
      const insertPaymentValues = [
        res.rows[0].orderid,
        data.creditcardnum,
        data.usecash,
        data.usecreditcard,
        data.userewardpoints,
      ];
      const paymentID = await client.query(insertPayment, insertPaymentValues);

      // Create Request
      const insertRequest = 'INSERT INTO Requests(paymentID, orderID, customerID) VALUES ($1, $2, $3)';
      const insertRequestValues = [paymentID.rows[0].paymentid, res.rows[0].orderid, data.customerid];
      await client.query(insertRequest, insertRequestValues);

      // Create Contains
      const insertContains = 'INSERT INTO Contains(quantity, foodItemID, orderID) VALUES ($1, $2, $3)';
      for (var i = 0; i < fooditems.length; i++) {
        const insertContainsValues = [fooditems[i].quantity, fooditems[i].fooditemid, res.rows[0].orderid];
        await client.query(insertContains, insertContainsValues);
      }

      // Create Applies that links an order to a promotion
      if (promotionId !== null) {
        const insertApplies = 'INSERT INTO Applies(orderID,promotionID) VALUES ($1, $2)';
        const insertAppliesValues = [res.rows[0].orderid, promotionId];
        await client.query(insertApplies, insertAppliesValues);
      }

      // Get customer's reward points:
      const getCusRewardPoints = `SELECT rewardPoints FROM Customers WHERE customerID = $1`;
      const cusRP = await client.query(getCusRewardPoints, [data.customerid]);

      // Customer use reward points to offset delivery fee
      if (data.rewardpoints > 0 && data.userewardpoints === true) {
        let remainRP = cusRP.rows[0].rewardpoints - data.rewardpoints;
        const updateRewards = 'UPDATE Customers SET rewardPoints = $1 WHERE customerID = $2';
        const updateRewardsValues = [remainRP, data.customerid];
        await client.query(updateRewards, updateRewardsValues);
      }

      await client.query('COMMIT', (error, results) => {
        if (error) {
          const msg = {
            message: error,
          };
          response.status(400).send(msg);
          throw error;
        }
        const msg = {
          success: 'True',
          message: `Order has been created successfully`,
          data: data,
        };
        response.status(201).send(msg);
      });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  })().catch((e) => console.error(e.stack));
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
  getPastOrdersWithRes,
  getAnOrderByCusIdNOrderId,
  postOrder,
  getAllReviews,
  getReviewsForFoodItem,
  getReviewForFoodItemByOrderId,
  getFoodItemReviewsByRestaurantID,
  postReview,
  updateReview,
  deleteReview,
  getCustomerCreditCards,
  getCustomerCreditCard,
  addCustomerCreditCard,
  updateCustomerCreditCard,
  deleteCustomerCreditCard,
  rateRider,
  getRiderRating,
};
