const pool = require('../../pool.js');

const getFDSManagers = (request, response) => {
  pool.query('SELECT * FROM FDSManagers ORDER BY managerid ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getFDSManagersById = (request, response) => {
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

const updateFDSManagers = (request, response) => {
  const managerid = parseInt(request.params.managerid);
  const managername = request.body.managername;

  pool.query(
    'UPDATE FDSManagers SET managername = $1 WHERE managerid = $2 RETURNING *',
    [managername, managerid],
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Manager has been updated with manager name: ${results.rows[0].managername}`);
    }
  );
};

const deleteFDSManagers = (request, response) => {
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
               ORDER BY 1,2,3`,
  };

  pool.query(query, (error, results) => {
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
        WITH OrdersByMonth_Riders AS
        (SELECT TO_CHAR(TO_TIMESTAMP((EXTRACT(month from O.orderplacedtimestamp::date))::text, 'MM'), 'Mon') as month, 
                EXTRACT(year from O.orderplacedtimestamp::date) as year,
                orderID,
                riderID,
                riderDepartForResTimeStamp,
                riderDeliverOrderTimeStamp
        FROM Orders O
        ORDER BY 1,2)


        SELECT riderid, month, year, COUNT(*) AS totalNumberOrdersDelivered, 
        NULL AS totalHoursWorked,
        baseSalary AS totalSalaryEarned, 
        AVG(
            TRUNC(
                EXTRACT(
                    EPOCH FROM AGE(O.riderDeliverOrderTimeStamp, O.riderDepartForResTimeStamp))/60)
        ) as averageDeliveryTime,
        COUNT(rating) as numRatings,
        AVG(rating) as averageRating
        FROM OrdersByMonth_Riders O join Riders using (riderID) left join Rates using (riderID)
        GROUP BY Month, Year, RiderID, totalSalaryEarned;
    `;

  pool.query(query, (error, results) => {
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
  };
  const values = [data.promotionstarttimestamp, data.promotionendtimestamp];
  const promotiontype = data.promotiontype;
  const promotiontypeinfo = data.promotiontypeinfo;

  const newPromotionQuery = `INSERT INTO Promotions (startTimeStamp, endTimeStamp) VALUES ($1, $2)`;

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
        response.status(201).send({ message: 'Promotion has been added successfully!' });
      });
    });
  });
};

module.exports = {
  getFDSManagers,
  getFDSManagersById,
  createFDSManager,
  updateFDSManagers,
  deleteFDSManagers,
  getFDSManagerSummaryOne,
  getFDSManagerSummaryTwo,
  getFDSManagerSummaryThree,
  getFDSManagerSummaryFour,
  postPromotion,
};
