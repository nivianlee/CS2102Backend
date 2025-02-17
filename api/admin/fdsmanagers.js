const pool = require('../../pool.js');

const getFDSManagers = (request, response) => {
  pool.query('SELECT * FROM FDSManagers ORDER BY managerid ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getFDSManagerById = (request, response) => {
  const managerid = parseInt(request.params.managerid);

  pool.query('SELECT * FROM FDSManagers WHERE managerid = $1', [managerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createFDSManager = (request, response) => {
  const data = {
    managerName: request.body.managerName,
    contactNum: request.body.contactNum,
  };
  const values = [data.managerName, data.contactNum];
  pool.query(
    'INSERT INTO FDSManagers (managerName, contactNum) VALUES ($1, $2) RETURNING *',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const updateFDSManager = (request, response) => {
  const managerid = parseInt(request.params.managerid);
  const managerName = request.body.managerName;
  const contactNum = request.body.contactNum;

  pool.query(
    'UPDATE FDSManagers SET managername = $1 WHERE managerid = $2 RETURNING *',
    [managerName, managerid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Manager has been updated with manager id: ${managerid}`);
    }
  );
};

const deleteFDSManager = (request, response) => {
  const managerid = parseInt(request.params.managerid);

  pool.query('DELETE FROM FDSManagers WHERE managerid = $1 RETURNING *', [managerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Manager with manager id ${results.rows[0].managerid} has been deleted`);
  });
};

const getFDSManagerSummaryOne = (request, response) => {
  const query = `
        SELECT month, year, numCustCreated, totalOrders, totalOrdersSum
        FROM CustPerMonth JOIN TotalCostPerMonth USING (month, year);
    `;

  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getFDSManagerSummaryTwo = (request, response) => {
  // const month = parseInt(request.params.month);
  // const year = request.params.year

  const query = {
    text: `with OrdersByMonth as (SELECT TO_CHAR(TO_TIMESTAMP((EXTRACT(month from O.orderplacedtimestamp::date))::text, 'MM'), 'Mon') as month, 
                                             EXTRACT(year from O.orderplacedtimestamp::date) as year,
                                             orderID
                                      FROM Orders O
                                      ORDER BY 1,2)
        
               SELECT month, year, customerID, count(*) AS totalNumOrdersByCust, sum(totalCostOfOrder) AS totalCostByCust
               FROM OrdersByMonth 
                    JOIN Requests USING (orderID) 
                    JOIN OrderCosts USING (orderID)
               GROUP BY 1,2,3
               ORDER BY to_date(month, 'Mon'),2,3`,
  };

  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getFDSManagerSummaryTwoByCustomerId = (request, response) => {
  const customerid = parseInt(request.params.customerid);

  const query = {
    text: `with OrdersByMonth as (SELECT TO_CHAR(TO_TIMESTAMP((EXTRACT(month from O.orderplacedtimestamp::date))::text, 'MM'), 'Mon') as month, 
                                             EXTRACT(year from O.orderplacedtimestamp::date) as year,
                                             orderID
                                      FROM Orders O
                                      ORDER BY 1,2)
        
               SELECT month, year, customerID, count(*) AS totalNumOrdersByCust, sum(totalCostOfOrder) AS totalCostByCust
               FROM OrdersByMonth 
                    JOIN Requests USING (orderID) 
                    JOIN OrderCosts USING (orderID)
               WHERE customerID = $1              
               GROUP BY 1,2,3
               ORDER BY to_date(month, 'Mon'),2,3`,
  };

  pool.query(query, [customerid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getFDSManagerSummaryThree = (request, response) => {
  const query = `
        SELECT deliveryAddress, 
               EXTRACT(HOUR FROM O.orderplacedtimestamp) AS hour, 
               COUNT(*) AS totalNumOrders
        FROM Orders O
        GROUP BY 1,2
        ORDER BY 1,2;
    `;

  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getFDSManagerSummaryFour = (request, response) => {
  const query = `
        WITH OrdersByMonth_Riders(month, year, orderID, riderID, riderDepartForResTimeStamp, riderDeliverOrderTimeStamp ) AS
        (SELECT TO_CHAR(TO_TIMESTAMP((EXTRACT(month from O.orderplacedtimestamp::date))::text, 'MM'), 'Mon') as month, 
                EXTRACT(year from O.orderplacedtimestamp::date) as year,
                orderID,
                riderID,
                riderDepartForResTimeStamp,
                riderDeliverOrderTimeStamp
        FROM Orders O
        ORDER BY 1,2),

        HoursByMonth_Riders(riderID, month, hoursWorked) AS 
         (SELECT * 
          FROM 
            ((SELECT riderID, 
                     TO_CHAR(TO_TIMESTAMP(CEILING(week/4 ::FLOAT)::TEXT, 'MM'), 'Mon') AS month, 
                     SUM(EXTRACT(HOUR FROM endTime) - EXTRACT(HOUR FROM startTime)) AS hoursWorked 
              FROM PartTimeSchedules
              GROUP BY riderID, month
              ORDER BY riderID, month)
                UNION
             (SELECT riderID, 
                     TO_CHAR(TO_TIMESTAMP(month::text, 'MM'), 'Mon') AS month, 
                     4*5*8*COUNT(*) AS hoursWorked -- 4 weeks, 5 days a week, 8 hours per day
              FROM FullTimeSchedules 
              GROUP BY riderID, month 
              ORDER BY riderID, month)) AS Result 
          ORDER BY riderID, month
        )
        
        SELECT  riderid, month, year, 
                COUNT(O.orderID) AS totalNumberOrdersDelivered, 
                COALESCE(hoursWorked, 0) AS totalHoursWorked,
                (SELECT COUNT(orderID)*5 +  
                       (CASE 
                          WHEN COUNT(orderID) > 5 THEN 100 
                          WHEN COUNT(orderID) > 10 THEN 300
                          ELSE 0
                        END) 
                 FROM OrdersByMonth_Riders
                 WHERE riderID = O.riderID
                 AND month = O.month
                 AND year = O.year) + baseSalary AS totalSalaryEarned, 
                AVG(
                    TRUNC(
                      EXTRACT(
                          EPOCH FROM AGE(O.riderDeliverOrderTimeStamp, O.riderDepartForResTimeStamp)
                      ) / 60
                    )
                ) AS averageDeliveryTime,
                COUNT(rating) AS numRatings,
                ROUND(AVG(rating),2) AS averageRating
        FROM OrdersByMonth_Riders O 
          JOIN Riders USING(riderID) -- to get baseSalary
          LEFT JOIN Rates USING(riderID)
          LEFT JOIN HoursByMonth_Riders H USING(riderID, month)
        GROUP BY month, year, riderID, hoursWorked, baseSalary
        ORDER BY riderID, month, year
        ;
    `;

  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getFDSManagerSummaryFourByRiderId = (request, response) => {
  const riderid = parseInt(request.params.riderid)
  const query = `
        WITH OrdersByMonth_Riders(month, year, orderID, riderID, riderDepartForResTimeStamp, riderDeliverOrderTimeStamp ) AS
        (SELECT TO_CHAR(TO_TIMESTAMP((EXTRACT(month from O.orderplacedtimestamp::date))::text, 'MM'), 'Mon') as month, 
                EXTRACT(year from O.orderplacedtimestamp::date) as year,
                orderID,
                riderID,
                riderDepartForResTimeStamp,
                riderDeliverOrderTimeStamp
        FROM Orders O
        ORDER BY 1,2),

        HoursByMonth_Riders(riderID, month, hoursWorked) AS 
         (SELECT * 
          FROM 
            ((SELECT riderID, 
                     TO_CHAR(TO_TIMESTAMP(CEILING(week/4 ::FLOAT)::TEXT, 'MM'), 'Mon') AS month, 
                     SUM(EXTRACT(HOUR FROM endTime) - EXTRACT(HOUR FROM startTime)) AS hoursWorked 
              FROM PartTimeSchedules
              GROUP BY riderID, month
              ORDER BY riderID, month)
                UNION
             (SELECT riderID, 
                     TO_CHAR(TO_TIMESTAMP(month::text, 'MM'), 'Mon') AS month, 
                     4*5*8*COUNT(*) AS hoursWorked -- 4 weeks, 5 days a week, 8 hours per day
              FROM FullTimeSchedules 
              GROUP BY riderID, month 
              ORDER BY riderID, month)) AS Result 
          ORDER BY riderID, month
        )
        
        SELECT  riderid, month, year, 
                COUNT(O.orderID) AS totalNumberOrdersDelivered, 
                COALESCE(hoursWorked, 0) AS totalHoursWorked,
                (SELECT COUNT(orderID)*5 +  
                       (CASE 
                          WHEN COUNT(orderID) > 5 THEN 100 
                          WHEN COUNT(orderID) > 10 THEN 300
                          ELSE 0
                        END) 
                 FROM OrdersByMonth_Riders
                 WHERE riderID = O.riderID
                 AND month = O.month
                 AND year = O.year) + baseSalary AS totalSalaryEarned, 
                AVG(
                    TRUNC(
                      EXTRACT(
                          EPOCH FROM AGE(O.riderDeliverOrderTimeStamp, O.riderDepartForResTimeStamp)
                      ) / 60
                    )
                ) AS averageDeliveryTime,
                COUNT(rating) AS numRatings,
                ROUND(AVG(rating),2) AS averageRating
        FROM OrdersByMonth_Riders O 
          JOIN Riders USING(riderID) -- to get baseSalary
          LEFT JOIN Rates USING(riderID)
          LEFT JOIN HoursByMonth_Riders H USING(riderID, month)
        WHERE riderID = $1
        GROUP BY month, year, riderID, hoursWorked, baseSalary
        ORDER BY riderID, month, year
        ;
    `;

  pool.query(query, [riderid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

/*
  Need to insert new rows into 2 tables when posting a new promotion.
    1. Promotions
    2. The specific promotion type to enforce covering constraint.
*/
const postPromotion = (request, response) => {
  const fdsmanagerid = parseInt(request.params.managerid);
  pool.query('SELECT * FROM FDSManagers WHERE managerID = $1', [fdsmanagerid], (error, results) => {
    if (error) {
      throw error;
    } else if (results.rows.length == 0) {
      console.error('Manager does not exist.');
      throw error;
    }
  });

  const data = {
    promotionstarttimestamp: request.body.promotionstarttimestamp,
    promotionendtimestamp: request.body.promotionendtimestamp,
    promotiontype: request.body.promotiontype,
    promotiontypeinfo: request.body.promotiontypeinfo,
    promodescription: request.body.promodescription,
  };
  const values = [data.promotionstarttimestamp, data.promotionendtimestamp, data.promodescription];
  const promotiontype = data.promotiontype;
  const promotiontypeinfo = data.promotiontypeinfo;

  const newPromotionQuery = `INSERT INTO Promotions (startTimeStamp, endTimeStamp, promoDescription) VALUES ($1, $2, $3)`;

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
  }

  // This first inserts a new row into Promotions
  pool.query(newPromotionQuery, values, (error, results) => {
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
        response.status(201).send({
          message: 'Promotion has been added successfully!'
        });
      });
    });
  });
};

module.exports = {
  getFDSManagers,
  getFDSManagerById,
  createFDSManager,
  updateFDSManager,
  deleteFDSManager,
  getFDSManagerSummaryOne,
  getFDSManagerSummaryTwo,
  getFDSManagerSummaryTwoByCustomerId,
  getFDSManagerSummaryThree,
  getFDSManagerSummaryFour,
  getFDSManagerSummaryFourByRiderId,
  postPromotion
};