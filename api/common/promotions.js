const pool = require('../../pool.js');

const getPromotions = (request, response) => {
  pool.query('SELECT * FROM Promotions', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getPromotionsNotNull = (request, response) => {
  const query = `
  SELECT *
  FROM Promotions P
  LEFT JOIN TargettedPromoCode USING (promotionID) 
  LEFT JOIN Percentage USING (promotionID) 
  LEFT JOIN Amount USING (promotionID) 
  LEFT JOIN FreeDelivery USING (promotionID)
  LEFT JOIN Offers USING (promotionID)
  WHERE  promotiondetails IS NOT NULL OR percentageamount IS NOT NULL OR absoluteamount IS NOT NULL OR deliveryamount IS NOT NULL
  `;
  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getPromotionsByID = (request, response) => {
  const promotionid = parseInt(request.params.promotionid);
  const query = `
    SELECT P.promotionID, P.startTimeStamp, P.endTimeStamp, promotionDetails, percentageAmount, absoluteAmount, deliveryAmount
    FROM Promotions P 
    LEFT JOIN TargettedPromoCode USING (promotionID) 
    LEFT JOIN Percentage USING (promotionID) 
    LEFT JOIN Amount USING (promotionID) 
    LEFT JOIN FreeDelivery USING (promotionID)
    WHERE P.promotionID = $1
  `;

  pool.query(query, [promotionid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getPromotionsByRestaurantID = (request, response) => {
  const restaurantid = parseInt(request.params.restaurantid);
  const query = `
    SELECT DISTINCT O.restaurantID, P.promotionID, P.startTimeStamp, P.endTimeStamp, promotionDetails, percentageAmount, absoluteAmount, deliveryAmount
    FROM Offers O JOIN 
    (
      Promotions P
      LEFT JOIN TargettedPromoCode USING (promotionID) 
      LEFT JOIN Percentage USING (promotionID) 
      LEFT JOIN Amount USING (promotionID) 
      LEFT JOIN FreeDelivery USING (promotionID)
    ) ON (O.promotionID = P.promotionID and O.restaurantID = $1) 
  `;

  pool.query(query, [restaurantid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

module.exports = {
  getPromotions,
  getPromotionsByID,
  getPromotionsNotNull,
  getPromotionsByRestaurantID,
};
