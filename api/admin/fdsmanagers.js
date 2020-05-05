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

const createFDSManagers = (request, response) => {
  const managername = request.body.managername;
  pool.query('INSERT INTO FDSManagers (managername) VALUES ($1) RETURNING *', [managername], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send(`Manager added with manager name: ${results.rows[0].managername}`);
  });
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
    `

  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
}

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
               ORDER BY to_date(month, 'Mon'),2,3`
  }

  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
}

const getFDSManagerSummaryThree = (request, response) => {
  const query = `
        SELECT deliveryAddress, 
               EXTRACT(HOUR FROM O.orderplacedtimestamp) AS hour, 
               COUNT(*) AS totalNumOrders
        FROM Orders O
        GROUP BY 1,2
        ORDER BY 1,2;
    `

  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
}

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
                COUNT(*) AS totalNumberOrdersDelivered, 
                COALESCE(hoursWorked, 0) AS totalHoursWorked,
                baseSalary AS totalSalaryEarned, 
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
    `

  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
}

module.exports = {
  getFDSManagers,
  getFDSManagersById,
  createFDSManagers,
  updateFDSManagers,
  deleteFDSManagers,
  getFDSManagerSummaryOne,
  getFDSManagerSummaryTwo,
  getFDSManagerSummaryThree,
  getFDSManagerSummaryFour
};