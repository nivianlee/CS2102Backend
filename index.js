const express = require('express');
const bodyParser = require('body-parser');
const db = require('./queries');
const customers = require('./api/customer/customers');
const fdsManagers = require('./api/admin/fdsmanagers');
const foodItems = require('./api/common/fooditems');
const app = express();
const port = 3000;

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.get('/', (request, response) => {
  response.json({
    info: 'Node.js, Express, and Postgres API'
  });
});


// customer apis
app.get('/customers', customers.getCustomers);
app.get('/customers/:customerid', customers.getCustomerById);
app.get('/customers/:customerid/addresses', customers.getAddresses);
app.get('/customers/:customerid/recentaddresses', customers.getRecentAddresses);
app.get('/customers/:customerid/savedaddresses', customers.getSavedAddresses);
app.post('/customers', customers.createCustomer);
app.put('/customers/:customerid', customers.updateCustomer);
app.delete('/customers/:customerid', customers.deleteCustomer);

// fooditems apis
app.get('/fooditems', foodItems.getFoodItems);
app.get('/fooditems/:restaurantid', foodItems.getFoodItemsByRestaurantId);

// admin: fdsManagers
app.get('/fdsManagers/summaryOne', fdsManagers.getFDSManagerSummaryOne);
app.get('/fdsManagers/summaryTwo', fdsManagers.getFDSManagerSummaryTwo);
app.get('/fdsManagers/summaryThree', fdsManagers.getFDSManagerSummaryThree);
app.get('/fdsManagers/summaryFour', fdsManagers.getFDSManagerSummaryFour);
app.get('/fdsManagers', fdsManagers.getFDSManagers);
app.get('/fdsManagers/:managerid', fdsManagers.getFDSManagersById);
app.post('/fdsManagers', fdsManagers.createFDSManagers);
app.post('/fdsManagers/:managerid', fdsManagers.updateFDSManagers);
app.delete('/fdsManagers/:managerid', fdsManagers.deleteFDSManagers);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});