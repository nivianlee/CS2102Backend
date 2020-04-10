const pool = require('../../pool.js');

const getPromotions = (request, response) => {
  pool.query('SELECT * FROM Promotions', (error, results) => {
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

module.exports = {
  getPromotions,
  getPromotionsByID
};
