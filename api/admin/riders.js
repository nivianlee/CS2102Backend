const pool = require('../../pool.js');

const getRiders = (request, response) => {
  pool.query('SELECT * FROM Riders ORDER BY riderID ASC', (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getRiderById = (request, response) => {
  const riderID = parseInt(request.params.riderid);

  pool.query('SELECT * FROM Riders WHERE riderID = $1', [riderID], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const createRider = (request, response) => {
  const data = {
    riderName: request.body.riderName,
    riderEmail: request.body.riderEmail,
    contactNum: request.body.contactNum,
    isOccupied: request.body.isOccupied,
    isFullTime: request.body.isFullTime,
    baseSalary: request.body.baseSalary,
  };
  const values = [data.riderName, data.riderEmail, data.isOccupied, data.contactNum, data.isFullTime, data.baseSalary];
  pool.query(
    'INSERT INTO Riders (riderName, riderEmail, isOccupied, contactNum, isFullTime, baseSalary) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(200).json(results.rows);
    }
  );
};

const updateRider = (request, response) => {
  const data = {
    riderName: request.body.riderName,
    riderEmail: request.body.riderEmail,
    contactNum: request.body.contactNum,
    isOccupied: request.body.isOccupied,
    isFullTime: request.body.isFullTime,
    baseSalary: request.body.baseSalary,
    riderID: parseInt(request.params.riderid),
  };
  const values = [
    data.riderName,
    data.riderEmail,
    data.isOccupied,
    data.contactNum,
    data.isFullTime,
    data.baseSalary,
    data.riderID,
  ];
  pool.query(
    'UPDATE Riders SET riderName = $1, riderEmail = $2, isOccupied = $3, contactNum = $4, isFullTime = $5, baseSalary = $6 WHERE riderID = $7 RETURNING *',
    values,
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send(`Rider has been updated with rider id: ${data.riderID}`);
    }
  );
};

const getAllRidersSummary = (request, response) => {
  const query = `
  WITH OrdersByMonth_Riders(month, year, riderID, ordersPerMonth) AS
  (SELECT TO_CHAR(TO_TIMESTAMP((EXTRACT(month from O.orderplacedtimestamp::date))::text, 'MM'), 'Mon') as month, 
          EXTRACT(year from O.orderplacedtimestamp::date) as year,
          riderID,
          COUNT(orderID) as ordersPerMonth
  FROM Orders O
  GROUP BY 1,2,3
  ORDER BY 1,2,3),

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

  SELECT riderid, H.month, ordersPerMonth, hoursWorked, 
        (SELECT ordersPerMonth*5 +  
               (CASE 
                  WHEN ordersPerMonth > 5 THEN 100 
                  WHEN ordersPerMonth > 10 THEN 300
                  ELSE 0
                END) + R.baseSalary
         FROM OrdersByMonth_Riders
             JOIN Riders R USING(riderid)
         WHERE riderID = O.riderID
         AND month = H.month
         AND year = O.year) AS totalSalaryEarned
  FROM OrdersByMonth_Riders O
    JOIN HoursByMonth_Riders H USING(riderid, month)
  ORDER BY month, riderid;`

  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
}

const getRiderSummaryById = (request, response) => {
  const query = `
  WITH OrdersByMonth_Riders(month, year, riderID, ordersPerMonth) AS
  (SELECT TO_CHAR(TO_TIMESTAMP((EXTRACT(month from O.orderplacedtimestamp::date))::text, 'MM'), 'Mon') as month, 
          EXTRACT(year from O.orderplacedtimestamp::date) as year,
          riderID,
          COUNT(orderID) as ordersPerMonth
  FROM Orders O
  GROUP BY 1,2,3
  ORDER BY 1,2,3),

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

  SELECT riderid, H.month, ordersPerMonth, hoursWorked, 
        (SELECT ordersPerMonth*5 +  
               (CASE 
                  WHEN ordersPerMonth > 5 THEN 100 
                  WHEN ordersPerMonth > 10 THEN 300
                  ELSE 0
                END) + R.baseSalary
         FROM OrdersByMonth_Riders
             JOIN Riders R USING(riderid)
         WHERE riderID = O.riderID
         AND month = H.month
         AND year = O.year) AS totalSalaryEarned
  FROM OrdersByMonth_Riders O
    JOIN HoursByMonth_Riders H USING(riderid, month)
  WHERE riderID = $1`

  pool.query(query, [request.params.riderid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
}

module.exports = {
  getRiders,
  getRiderById,
  createRider,
  updateRider,
  getAllRidersSummary,
  getRiderSummaryById
};