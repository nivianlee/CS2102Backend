const pool = require('../../pool.js');

const createRestaurantStaff = (request, response) => {
  const data = {
    name: request.body.restaurantstaffname,
    restaurantid: request.body.restaurantid
  };
  const values = [data.name, data.restaurantid];
  pool.query(
    'INSERT INTO RestaurantStaff (restaurantStaffName, restaurantID) VALUES ($1, $2)',
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
    name: request.body.restaurantstaffname,
    restaurantid: request.body.restaurantid,
    restaurantstaffid: request.params.restaurantstaffid
  };
  const values = [data.name, data.restaurantid, data.restaurantstaffid];
  pool.query(
    'UPDATE RestaurantStaff SET restaurantStaffName = $1, restaurantID = $2 WHERE restaurantStaffID = $3',
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
  const restaurantstaffid = parseInt(request.params.restaurantstaffid);

  pool.query('DELETE FROM RestaurantStaff WHERE restaurantStaffID = $1', [restaurantstaffid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).send({ message: 'Restaurant staff has been deleted successfully!' });
  });
};

const createFoodItem = (request, response) => {
  const data = {
    name: request.body.fooditemname,
    price: request.body.price,
    image: request.body.image,
    maxnumoforders: request.body.maxnumoforders,
    category: request.body.category,
    restaurantid: request.body.restaurantid,
    restaurantstaffid: request.body.restaurantstaffid
  };
  const values = [data.name, data.price, data.image, data.maxnumoforders, data.category, data.restaurantid];

  pool.query(
    'INSERT INTO FoodItems (foodItemName, price, image, maxNumOfOrders, category, restaurantID) VALUES ($1, $2, $3, $4, $5, $6)',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send({ message: 'Food item has been added successfully!' });
    }
  );
};

const updateFoodItem = (request, response) => {
  const data = {
    name: request.body.fooditemname,
    price: request.body.price,
    availability: request.body.availability,
    image: request.body.image,
    maxnumoforders: request.body.maxnumoforders,
    category: request.body.category,
    fooditemid: request.body.fooditemid
  };
  const values = [data.name, data.price, data.image, data.maxnumoforders, data.category, data.fooditemid];

  pool.query(
    'UPDATE FoodItems SET foodItemName = $1, price = $2, image = $3, maxNumOfOrders = $4, category = $5 WHERE foodItemID = $6',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send({ message: 'Food item has been updated successfully!' });
    }
  );
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

module.exports = {
  createRestaurantStaff,
  updateRestaurantStaff,
  deleteRestaurantStaff,
  createFoodItem,
  updateFoodItem,
  getAllCompletedOrders,
  getMonthlyCompletedOrders,
  getMonthlyCompletedOrdersStatistics,
  getMonthlyFavouriteFoodItems,
  getPromotionalCampaignsStatistics
};
