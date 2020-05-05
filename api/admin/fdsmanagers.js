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

module.exports = {
  getFDSManagers,
  getFDSManagerById,
  createFDSManager,
  updateFDSManager,
  deleteFDSManager,
  getFDSManagerSummaryOne,
  getFDSManagerSummaryTwo,
  getFDSManagerSummaryThree,
  getFDSManagerSummaryFour,
};
