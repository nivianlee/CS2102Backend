const express = require('express');
const bodyParser = require('body-parser');
const db = require('./queries');
const customers = require('./customers');
const fdsManagers = require('./admin/fdsManagers');

const app = express();
const port = 3000;

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.get('/customers', customers.getCustomers);

app.get('/users', db.getUsers);
app.get('/fdsManagers', fdsManagers.getFDSManagers);
app.get('/fdsManagers/:id', fdsManagers.getFDSManagerById);
app.post('/fdsManagers', fdsManagers.createFDSManagers);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
