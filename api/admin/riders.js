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


const toggleUpdateRiderOrderTimestamp = (request, response) => {
  const data = {
    orderid: parseInt(request.body.orderid)
  }
  pool.query(`SELECT riderDepartForResTimeStamp,riderArriveAtResTimeStamp,
                     riderCollectOrderTimeStamp,riderDeliverOrderTimeStamp,
                     riderID
              FROM Orders 
              WHERE orderid = $1;`, [data.orderid], (error, results) => {
    if (error) {
      throw error;
    }
    const values = Object.values(results.rows[0])
    const keys = Object.keys(results.rows[0])
    let keyToUpdate = null
    for (let i = 0; i < values.length - 1; i++) { // skip orderplacedtimestamp, avoid riderid
      if (values[i] === null) {
        keyToUpdate = keys[i]
        break
      }
    }
    // console.log(keyToUpdate)
    if (keyToUpdate !== null) {
      (async () => {
        const client = await pool.connect()

        try {
          await client.query('BEGIN')
          const query = `UPDATE Orders 
          SET ${keyToUpdate} = CURRENT_TIMESTAMP
          WHERE orderid = $1
          RETURNING *;`

          const values = [data.orderid]
          // console.log(values)
          await client.query(query, values, (error, results) => {
            if (error) {
              throw error;
            }
          });
          if (keyToUpdate == "riderdepartforrestimestamp") { // first timestamp updated, update isOccupied = True
            const query = `UPDATE Riders 
                           SET isOccupied = TRUE
                           WHERE riderID = $1
                           RETURNING *;`

            const riderid = parseInt(values[values.length - 1]);
            await client.query(query, [riderid], (error, results) => {
              if (error) {
                throw error
              }
              response.status(201).send({
                message: `Successfully updated ${keyToUpdate} for ${data.orderid}, and updated Rider ${riderid}.isOccupied = TRUE`,
                "results": results.rows
              })
            })
          } else if (keyToUpdate == "riderdeliverordertimestamp") { // last timestamp updated, update isOccupied = False
            const query = `UPDATE Riders 
                           SET isOccupied = FALSE
                           WHERE riderID = $1
                           RETURNING *;
            `
            const riderid = parseInt(values[values.length - 1]);
            await client.query(query, [riderid], (error, results) => {
              if (error) {
                throw error
              }
              response.status(201).send({
                message: `Successfully updated ${keyToUpdate} for ${data.orderid}, and updated Rider ${riderid}.isOccupied = FALSE`,
                "results": results.rows
              })
            })
          } else {
            response.status(201).send({
              message: `Successfully updated ${keyToUpdate} for ${data.orderid}`,
              "results": results.rows
            })
          }
          await client.query('COMMIT')
        } catch (e) {
          await client.query('ROLLBACK')
          throw e
        } finally {
          client.release()
        }
      })().catch(e => console.error(e.stack))
    } else {
      response.status(200).send({
        message: `All timestamps are already updated, delivery has been completed.`
      })
    }
  })
}

module.exports = {
  getRiders,
  getRiderById,
  createRider,
  updateRider,
  toggleUpdateRiderOrderTimestamp
};