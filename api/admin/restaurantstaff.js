const pool = require('../../pool.js');

const getRestaurantStaffs = (request, response) => {
  const restaurantID = parseInt(request.params.restaurantid);
  pool.query(
    'SELECT * FROM RestaurantStaff WHERE restaurantid = $1 ORDER BY restaurantStaffID ASC',
    [restaurantID],
    (error, results) => {
      if (error) {
        throw error;
      }
      console.log(results.rows.length);
      if (results.rows.length > 0) {
        response.status(200).json(results.rows);
      } else {
        response.status(200).send({
          message: `Restaurant with id ${restaurantID} does not have any staff`,
        });
      }
    }
  );
};

const getRestaurantStaffById = (request, response) => {
  const restaurantID = parseInt(request.params.restaurantid);
  const restaurantStaffID = parseInt(request.params.restaurantstaffid);
  pool.query(
    'SELECT * FROM RestaurantStaff WHERE restaurantid = $1 AND restaurantstaffid = $2',
    [restaurantID, restaurantStaffID],
    (error, results) => {
      if (error) {
        throw error;
      }
      if (results.rows.length === 1) {
        response.status(200).json(results.rows);
      } else {
        response.status(200).send({
          message: `Restaurant staff with id ${restaurantStaffID} does not belong to restaurant with id ${restaurantID}`,
        });
      }
    }
  );
};

const createRestaurantStaff = (request, response) => {
  const data = {
    restaurantStaffName: request.body.restaurantStaffName,
    contactNum: request.body.contactNum,
    restaurantid: request.body.restaurantID,
  };
  const values = [data.restaurantStaffName, data.contactNum, data.restaurantid];
  pool.query(
    'INSERT INTO RestaurantStaff (restaurantStaffName, contactNum, restaurantID) VALUES ($1, $2, $3)',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send({ message: 'Restaurant staff has been added successfully!' });
    }
  );
};

const updateRestaurantStaff = (request, response) => {
  const data = {
    restaurantStaffName: request.body.restaurantStaffName,
    contactNum: request.body.contactNum,
    restaurantID: request.body.restaurantID,
    restaurantStaffID: parseInt(request.params.restaurantStaffID),
  };
  const values = [data.restaurantStaffName, data.contactNum, data.restaurantID, data.restaurantStaffID];
  pool.query(
    'UPDATE RestaurantStaff SET restaurantStaffName = $1, contactNum = $2, restaurantID = $3 WHERE restaurantStaffID = $4',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).send({ message: 'Restaurant staff has been updated successfully!' });
    }
  );
};

const deleteRestaurantStaff = (request, response) => {
  const restaurantStaffID = parseInt(request.params.restaurantstaffid);

  pool.query('DELETE FROM RestaurantStaff WHERE restaurantStaffID = $1', [restaurantStaffID], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send({ message: 'Restaurant staff has been deleted successfully!' });
  });
};

const createFoodItem = (request, response) => {
  const data = {
    fooditemname: request.body.foodItemName,
    price: request.body.price,
    availabilitystatus: request.body.availabilityStatus,
    image: request.body.image,
    maxnumoforders: request.body.maxNumOfOrders,
    category: request.body.category,
    restaurantid: request.body.restaurantID,
    restaurantstaffid: parseInt(request.params.restaurantstaffid),
  };

  const values = [
    data.fooditemname,
    data.price,
    data.availabilitystatus,
    data.image,
    data.maxnumoforders,
    data.category,
    data.restaurantid,
    data.restaurantstaffid,
  ];

  const query = `
    INSERT INTO FoodItems (foodItemName, price, availabilitystatus, image, maxNumOfOrders, category, restaurantID)
    SELECT $1, $2, $3, $4, $5, $6, $7
    WHERE EXISTS (
      SELECT 1
      FROM RestaurantStaff
      WHERE restaurantID = $7 AND restaurantStaffID = $8
    ) RETURNING *`;

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    if (results.rows.length === 1) {
      response.status(201).send(`Food item ${results.rows.fooditemname} has been added successfully!`);
    } else {
      response
        .status(201)
        .send(
          `Restaurant staff with id ${data.restaurantstaffid} does not belong to restaurant with id ${data.restaurantid}`
        );
    }
  });
};

const updateFoodItem = (request, response) => {
  const data = {
    fooditemname: request.body.foodItemName,
    price: request.body.price,
    availabilitystatus: request.body.availabilityStatus,
    image: request.body.image,
    maxnumoforders: request.body.maxNumOfOrders,
    category: request.body.category,
    restaurantid: request.body.restaurantID,
    restaurantstaffid: parseInt(request.params.restaurantstaffid),
    fooditemid: request.body.foodItemID,
  };

  const values = [
    data.fooditemname,
    data.price,
    data.availabilitystatus,
    data.image,
    data.maxnumoforders,
    data.category,
    data.restaurantid,
    data.restaurantstaffid,
    data.fooditemid,
  ];

  const query = `
    UPDATE FoodItems SET foodItemName = $1, price = $2, availabilitystatus = $3, image = $4, maxNumOfOrders = $5, category = $6
    WHERE foodItemID = $9 
    AND EXISTS (
      SELECT 1
      FROM RestaurantStaff
      WHERE restaurantID = $7 AND restaurantStaffID = $8
    ) RETURNING *`;

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    if (results.rows.length === 1) {
      response.status(201).send(`Food item has been updated successfully!`);
    } else {
      response
        .status(201)
        .send(
          `Restaurant staff with id ${data.restaurantstaffid} does not belong to restaurant with id ${data.restaurantid}`
        );
    }
  });
};

const deleteFoodItem = (request, response) => {
  const data = {
    restaurantid: request.body.restaurantID,
    restaurantstaffid: parseInt(request.params.restaurantstaffid),
    fooditemid: request.body.foodItemID,
  };

  const values = [data.restaurantid, data.restaurantstaffid, data.fooditemid];

  const query = `
    DELETE FROM FoodItems 
    WHERE foodItemID = $3
    AND EXISTS (
      SELECT 1
      FROM RestaurantStaff
      WHERE restaurantID = $1 AND restaurantStaffID = $2
    ) RETURNING *`;

  pool.query(query, values, (error, results) => {
    if (error) {
      throw error;
    }
    if (results.rows.length === 1) {
      response.status(201).send({ message: `Food item with id ${results.rows.fooditemid} has been deleted` });
    } else {
      response.status(200).send({
        message: `Restaurant staff with id ${data.restaurantstaffid} does not belong to restaurant with id ${data.restaurantid}`,
      });
    }
  });
};

const getAllCompletedOrders = (request, response) => {
  const restaurantstaffid = request.params.restaurantstaffid;
  const query = `
    SELECT DISTINCT T.orderID, T.orderPlacedTimeStamp, T.foodItemID, T.price, T.quantity, T.restaurantID
    FROM TotalCompletedOrders T, RestaurantStaff R
    WHERE R.restaurantStaffID = $1
    AND T.restaurantID = R.restaurantID
  `;

  pool.query(query, [restaurantstaffid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getMonthlyCompletedOrders = (request, response) => {
  const restaurantstaffid = request.params.restaurantstaffid;
  const year = request.params.year;
  const month = request.params.month;
  const query = `
      SELECT DISTINCT T.orderID, T.orderPlacedTimeStamp, T.foodItemID, T.foodItemName, (T.price * T.quantity) AS cost, T.restaurantID
      FROM TotalCompletedOrders T, RestaurantStaff R
      WHERE R.restaurantStaffID = $1
      AND T.restaurantID = R.restaurantID
      AND EXTRACT(YEAR FROM orderPlacedTimeStamp) = $2 
      AND EXTRACT(MONTH FROM orderPlacedTimeStamp) = $3
  `;

  pool.query(query, [restaurantstaffid, year, month], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getMonthlyCompletedOrdersStatistics = (request, response) => {
  const restaurantstaffid = request.params.restaurantstaffid;
  const year = request.params.year;
  const month = request.params.month;
  const query = `
    WITH MonthlyOrders AS (
      SELECT DISTINCT T.orderID, T.orderPlacedTimeStamp, T.foodItemID, T.foodItemName, (T.price * T.quantity) AS cost, T.restaurantID
      FROM TotalCompletedOrders T, RestaurantStaff R
      WHERE R.restaurantStaffID = $1
      AND T.restaurantID = R.restaurantID
      AND EXTRACT(YEAR FROM orderPlacedTimeStamp) = $2 
      AND EXTRACT(MONTH FROM orderPlacedTimeStamp) = $3
    )
    SELECT DISTINCT count(DISTINCT orderID) AS totalMonthlyCompletedOrders, sum(cost) AS totalCost
    FROM MonthlyOrders
  `;

  pool.query(query, [restaurantstaffid, year, month], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getMonthlyFavouriteFoodItems = (request, response) => {
  const restaurantstaffid = request.params.restaurantstaffid;
  const year = request.params.year;
  const month = request.params.month;
  const query = `
    WITH MonthlyOrders AS (
      SELECT DISTINCT T.orderID, T.orderPlacedTimeStamp, T.foodItemID, T.foodItemName, (T.price * T.quantity) AS cost, T.restaurantID
      FROM TotalCompletedOrders T, RestaurantStaff R
      WHERE R.restaurantStaffID = $1
      AND T.restaurantID = R.restaurantID
      AND EXTRACT(YEAR FROM orderPlacedTimeStamp) = $2 
      AND EXTRACT(MONTH FROM orderPlacedTimeStamp) = $3
    ),
    MonthlyOrderStatistics as (
      SELECT DISTINCT count(orderID) as numOfOrders, foodItemID
      FROM MonthlyOrders
      GROUP BY foodItemID
    )
    SELECT DISTINCT F.foodItemName, M.numOfOrders
    FROM MonthlyOrderStatistics M join FoodItems F using (foodItemID)
    ORDER BY numOfOrders
    LIMIT 5
  `;

  pool.query(query, [restaurantstaffid, year, month], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getPromotionalCampaignsStatistics = (request, response) => {
  const restaurantstaffid = request.params.restaurantstaffid;
  const query = `
    WITH RestaurantOrders AS (
      SELECT DISTINCT T.orderID, T.orderPlacedTimeStamp, T.foodItemID, T.price, T.quantity, T.restaurantID
      FROM TotalCompletedOrders T, RestaurantStaff R
      WHERE R.restaurantStaffID = $1
      AND T.restaurantID = R.restaurantID
    ),
    PromotionalCampaignsStatistics AS (
      SELECT DISTINCT P.promotionID, count(distinct orderID) as numOfOrders, (P.endTimeStamp - P.startTimeStamp) as duration
      FROM Promotions P natural join (Applies A natural join RestaurantOrders R)
      GROUP BY P.promotionID
    )
    SELECT DISTINCT P.promotionID, S.numOfOrders, S.duration, S.numOfOrders / (EXTRACT(HOUR FROM date_trunc('hour', S.duration + '30 minute')) / 24) as ordersperday
    FROM Promotions P natural join PromotionalCampaignsStatistics S
    ORDER BY P.promotionID ASC;
  `;

  pool.query(query, [restaurantstaffid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

/*
  Need to insert new rows into 3 tables when posting a new promotion.
    1. Promotions
    2. Offers
    3. The specific promotion type to enforce covering constraint.
*/
const postPromotion = (request, response) => {
  const restaurantstaffid = parseInt(request.params.restaurantstaffid);
  pool.query('SELECT * FROM RestaurantStaff WHERE restaurantStaffID = $1', [restaurantstaffid], (error, results) => {
    if (error) {
      throw error;
    } else if (results.rows.length == 0) {
      console.error('Restaurant Staff does not exist.');
      throw error;
    }
  });

  const data = {
    promotionstarttimestamp: request.body.promotionstarttimestamp,
    promotionendtimestamp: request.body.promotionendtimestamp,
    promotiontype: request.body.promotiontype,
    promotiontypeinfo: request.body.promotiontypeinfo,
  };
  const values = [data.promotionstarttimestamp, data.promotionendtimestamp];
  const promotiontype = data.promotiontype;
  const promotiontypeinfo = data.promotiontypeinfo;

  const newPromotionQuery = `INSERT INTO Promotions (startTimeStamp, endTimeStamp) VALUES ($1, $2)`;
  const offerQuery = `
    INSERT INTO Offers(restaurantID, promotionID)
    SELECT restaurantID, (
      SELECT promotionID
      FROM Promotions
      ORDER BY promotionID DESC
      limit 1
    )
    FROM RestaurantStaff
    WHERE restaurantStaffID = $1
  `;
  let specificPromoQuery = '';
  let updateQuery = '';
  if (promotiontype == 'TargettedPromoCode') {
    specificPromoQuery = `
      INSERT INTO TargettedPromoCode (promotionID)
      SELECT promotionID
      FROM Promotions
      ORDER BY promotionID DESC
      limit 1
    `;
    updateQuery = `
      UPDATE TargettedPromoCode 
      SET promotionDetails = $1
      WHERE promotionID = (
        SELECT promotionID
        FROM Promotions
        ORDER BY promotionID DESC
        limit 1
      )
    `;
  } else if (promotiontype == 'Percentage') {
    specificPromoQuery = `
      INSERT INTO Percentage (promotionID)
      SELECT promotionID
      FROM Promotions
      ORDER BY promotionID DESC
      limit 1
    `;
    updateQuery = `
      UPDATE Percentage 
      SET percentageAmount = $1
      WHERE promotionID = (
        SELECT promotionID
        FROM Promotions
        ORDER BY promotionID DESC
        limit 1
      )
    `;
  } else if (promotiontype == 'Amount') {
    specificPromoQuery = `
      INSERT INTO Amount (promotionID)
      SELECT promotionID
      FROM Promotions
      ORDER BY promotionID DESC
      limit 1
    `;
    updateQuery = `
      UPDATE Amount 
      SET absoluteAmount = $1
      WHERE promotionID = (
        SELECT promotionID
        FROM Promotions
        ORDER BY promotionID DESC
        limit 1
      )
    `;
  } else if (promotiontype == 'FreeDelivery') {
    specificPromoQuery = `
      INSERT INTO FreeDelivery (promotionID)
      SELECT promotionID
      FROM Promotions
      ORDER BY promotionID DESC
      limit 1
    `;
    updateQuery = `
      UPDATE FreeDelivery 
      SET deliveryAmount = $1
      WHERE promotionID = (
        SELECT promotionID
        FROM Promotions
        ORDER BY promotionID DESC
        limit 1
      )
    `;
  } else {
    console.error('Invalid promotion type');
    throw error;
  }

  // This first inserts a new row into Promotions
  pool.query(newPromotionQuery, values, (error, results) => {
    if (error) {
      pool.query('ROLLBACK', (err) => {
        err ? console.error('Error rolling back client', err.stack) : console.log('Rolled back successfully');
      });
    }
    // Next, a new row is inserted for Offers for the newly inserted promotionID.
    pool.query(offerQuery, [restaurantstaffid], (error, results) => {
      if (error) {
        pool.query('ROLLBACK', (err) => {
          err ? console.error('Error rolling back client', err.stack) : console.log('Rolled back successfully');
        });
      }
      pool.query(specificPromoQuery, (error, results) => {
        if (error) {
          pool.query('ROLLBACK', (err) => {
            err ? console.error('Error rolling back client', err.stack) : console.log('Rolled back successfully');
          });
        }
        // Lastly, a new row is inserted into a specific promotion type.
        pool.query(updateQuery, [promotiontypeinfo], (error, results) => {
          if (error) {
            pool.query('ROLLBACK', (err) => {
              err ? console.error('Error rolling back client', err.stack) : console.log('Rolled back successfully');
            });
          }
          response.status(201).send('Promotion has been added successfully!');
        });
      });
    });
  });
};

module.exports = {
  getRestaurantStaffs,
  getRestaurantStaffById,
  createRestaurantStaff,
  updateRestaurantStaff,
  deleteRestaurantStaff,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  getAllCompletedOrders,
  getMonthlyCompletedOrders,
  getMonthlyCompletedOrdersStatistics,
  getMonthlyFavouriteFoodItems,
  getPromotionalCampaignsStatistics,
  postPromotion,
};
