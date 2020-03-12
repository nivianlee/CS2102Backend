const express = require('express');
const bodyParser = require('body-parser');
const db = require('./queries');
const cusDb = require('./customer/customers');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.get('/', (request, response) => {
  response.json({ info: 'Node.js, Express, and Postgres API' });
});

app.get('/users', db.getUsers);
app.get('/customers', cusDb.getCustomers);
app.get('/customers/:id', cusDb.getCustomerById);
app.post('/customers', cusDb.createCustomer);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
