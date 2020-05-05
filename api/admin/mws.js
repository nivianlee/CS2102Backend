const pool = require('../../pool.js');

const getMwsFullTimeRiders = (request, response) => {
  const query = `
    SELECT * 
    FROM FullTimeSchedules  
          JOIN Shifts USING(shiftID)
          JOIN DayRanges USING(rangeID)
    ;
  `
  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getMwsFullTimeRiderById = (request, response) => {
  const query = `
    SELECT * 
    FROM FullTimeSchedules  
          JOIN Shifts USING(shiftID)
          JOIN DayRanges USING(rangeID)
    WHERE riderID = $1 
    ;
  `
  const riderid = parseInt(request.params.riderid)
  pool.query(query, [riderid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getMwsFullTimeRiderByMonth = (request, response) => {
  const query = `
    SELECT * 
    FROM FullTimeSchedules  
          JOIN Shifts USING(shiftID)
          JOIN DayRanges USING(rangeID)
    WHERE riderID = $1 
    AND month = $2
    ;
  `
  const riderid = parseInt(request.params.riderid)
  const monthid = parseInt(request.params.monthid)
  pool.query(query, [riderid, monthid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getWwsPartTimeRiders = (request, response) => {
  const query = `
    SELECT * 
    FROM PartTimeSchedules  
    ;
  `
  pool.query(query, (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getWwsPartTimeRiderById = (request, response) => {
  const query = `
    SELECT * 
    FROM PartTimeSchedules  
    WHERE riderID = $1 
    ;
  `
  const riderid = parseInt(request.params.riderid)

  pool.query(query, [riderid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const getWwsPartTimeRiderByMonth = (request, response) => {
  const query = `
    SELECT * 
    FROM PartTimeSchedules  
    WHERE riderID = $1 
    AND CEILING(week / 4 ::float) = $2
    ;
  `
  const riderid = parseInt(request.params.riderid)
  const monthid = parseInt(request.params.monthid)

  pool.query(query, [riderid, monthid], (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

// RiderID must already exist in Riders table
const createMwsFullTimeRider = (request, response) => {
  const query = `INSERT INTO FullTimeSchedules(riderID, shiftID, rangeID, month)
                 VALUES ($1, $2, $3, $4) 
                 RETURNING *
  `
  const data = {
    riderid: request.body.riderid,
    shiftid: request.body.shiftid,
    rangeid: request.body.rangeid,
    monthid: request.body.monthid
  }
  pool.query(query, Object.values(data), (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

// Precondition: All arrays are of equal length
const createWwsPartTimeRider = (request, response) => {
  const query = `INSERT INTO PartTimeSchedules (riderID,startTime,endTime,week,day) 
  VALUES ($1, $2, $3, $4, $5) RETURNING *`
  const data = {
    rideridArr: request.body.rideridArr,
    startTimeArr: request.body.startTimeArr,
    endTimeArr: request.body.endTimeArr,
    weekArr: request.body.weekArr,
    dayArr: request.body.dayArr
  };
  (async () => {
    const client = await pool.connect()

    try {
      await client.query('BEGIN')
      for (let i = 0; i < data['rideridArr'].length; i++) { // iterate through all arrays 
        const values = [data['rideridArr'][i], data['startTimeArr'][i],
          data['endTimeArr'][i], data['weekArr'][i], data['dayArr'][i]
        ]
        await client.query(query, values, (error, results) => {
          if (error) {
            throw error;
          }
        });
      }
      await client.query('COMMIT', (error, results) => {
        const msg = {
          "success": "True",
          "message": `Successful creation of values in PartTimeSchedules with the given values`,
          "data": data
        }
        response.status(201).send(msg);
      })
    } catch (e) {
      await client.query('ROLLBACK')
      throw e
    } finally {
      client.release()
    }
  })().catch(e => console.error(e.stack))
};

const updateMwsFullTimeRider = (request, response) => {
  const query = `UPDATE FullTimeSchedules SET riderid = $1, 
  shiftID = $2, rangeID = $3, month = $4
  RETURNING *
  ;`

  const data = {
    riderid: parseInt(request.body.riderid),
    shiftid: parseInt(request.body.shiftid),
    rangeid: parseInt(request.body.rangeid),
    month: parseInt(request.body.month)
  };

  pool.query(query, Object.values(data),
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send({
        message: "Succesful update of MWS for FullTime rider!"
      });
    }
  );
};

// Updates a MWS row for a FullTime rider 
const updateWwsPartTimeRider = (request, response) => {
  const query = `UPDATE FullTimeSchedules 
                 SET shiftID = $2, rangeID = $3 
                 WHERE riderid = $1
                 AND month = $4
                 RETURNING *
                 ;`

  const data = {
    riderid: request.body.riderid,
    shiftid: request.body.shiftid,
    rangeid: request.body.rangeid,
    month: request.body.month
  };

  pool.query(query, Object.values(data),
    (error, results) => {
      if (error) {
        throw error;
      }
      response.status(201).send({
        message: "Succesful update of MWS for FullTime rider!",
        "results": results.rows
      });
    }
  );
};

// // Updates a WWS time period for a Part Time rider 
// const updateWwsPartTimeRider = (request, response) => {
//   const query = `UPDATE PartTimeSchedules 
//                  startTime = $2, endTime = $3, week = $4, day = $5
//                  WHERE riderid = $1 
//                  AND week = $4
//                  AND day = $5
//                  AND () 

//                  RETURNING *
//                  ;`

//   const data = {
//     riderid: request.body.riderid,
//     startTime: request.body.startTime,
//     endTime: request.body.endTime,
//     week: request.body.week,
//     day: request.body.day
//   };

//   pool.query(query, Object.values(data),
//     (error, results) => {
//       if (error) {
//         throw error;
//       }
//       response.status(201).send({
//         message: "Succesful update of WWS for PartTime rider!"
//       });
//     }
//   );
// };

const deleteMwsFullTimeRiderByMonth = (request, response) => {
  const query = `DELETE FROM FullTimeSchedules 
                 WHERE riderID = $1
                 AND month = $2
                 RETURNING *`
  const data = {
    riderid: request.body.riderid,
    monthid: request.body.monthid,
  };
  pool.query(query, Object.values(data), (error, results) => {
    if (error) {
      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const deleteWwsPartTimeRiderByWeek = (request, response) => {
  const query = `DELETE FROM PartTimeSchedules 
                 WHERE riderID = $1
                 AND startTime = $2
                 AND endTime = $3
                 AND week = $4
                 AND day = $5`
  const data = {
    riderid: parseInt(request.body.riderid),
    startTime: request.body.startTime,
    endTime: request.body.endTime,
    week: request.body.week,
    day: request.body.day
  }

  pool.query(query, Object.values(data), (error, results) => {
    if (error) {
      throw error;
    }
    response.status(201).send({
      message: `Rider with riderID = ${data.riderid} at ${data.startTime} to ${data.endTime} on Week ${data.week} and Day ${data.day} has been deleted`
    });
  });
};

module.exports = {
  getMwsFullTimeRiders,
  getMwsFullTimeRiderByMonth,
  getMwsFullTimeRiderById,
  getWwsPartTimeRiders,
  getWwsPartTimeRiderById,
  getWwsPartTimeRiderByMonth,
  createMwsFullTimeRider,
  createWwsPartTimeRider,
  updateMwsFullTimeRider,
  updateWwsPartTimeRider,
  deleteMwsFullTimeRiderByMonth,
  deleteWwsPartTimeRiderByWeek
};