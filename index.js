const express = require('express');
const bodyParser = require('body-parser');
const customers = require('./api/customer/customers');
const fdsManagers = require('./api/admin/fdsmanagers');
const restaurants = require('./api/admin/restaurants');
const restaurantstaff = require('./api/admin/restaurantstaff');
const foodItems = require('./api/common/fooditems');
const promotions = require('./api/common/promotions');
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
    extended: true,
  })
);

app.get('/', (request, response) => {
  response.json({
    info: 'Node.js, Express, and Postgres API',
  });
});

// customer apis
app.post('/customer/login', customers.verifyUser); // CFE done
app.get('/customers', customers.getCustomers);
app.get('/customers/:customerid', customers.getCustomerById);
app.post('/customers', customers.createCustomer);
app.put('/customers/customerid/:customerid', customers.updateCustomer);
app.delete('/customers/customerid/:customerid', customers.deleteCustomer);

app.get('/customers/:customerid/addresses', customers.getAddresses);
app.post('/customers/:customerid/addresses', customers.postAddress);
app.put('/customers/:customerid/addresses', customers.updateAddress);
app.delete('/customers/:customerid/addresses/:addressid', customers.deleteAddress);

app.get('/customers/currentorders/:customerid', customers.getCurrentOrders);
app.get('/customers/pastorders/:customerid', customers.getPastOrders);
app.get('/customers/:customerid/order/:orderid', customers.getAnOrderByCusId);

app.get('/customers/reviews', customers.getAllReviews);
app.get('/customers/reviews/:fooditemid', customers.getReviewsForFoodItem);

app.post('/customers/reviews', customers.postReview);
app.put('/customers/reviews', customers.updateReview);
app.delete('/customers/reviews', customers.deleteReview);

app.get('/customers/creditcards/:customerid', customers.getCustomerCreditCards);
app.post('/customers/creditcard/:customerid', customers.addCustomerCreditCard);
app.put('/customers/creditcard/:customerid', customers.updateCustomerCreditCard);
app.delete('/customers/creditcard/:customerid', customers.deleteCustomerCreditCard);

// restaurant apis
app.get('/restaurants', restaurants.getRestaurants); // CFE done

// fooditems apis
app.get('/fooditems', foodItems.getFoodItems);
app.get('/fooditems/:restaurantid', foodItems.getFoodItemsByRestaurantId); // CFE done
app.get('/promotions', promotions.getPromotions);
app.get('/promotions/:promotionid', promotions.getPromotionsByID);

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

// admin: restaurant
app.get('/restaurants', restaurants.getRestaurants);
app.get('/restaurants/:restaurantid', restaurants.getRestaurantById);
app.get('/restaurants/restaurantName/:restaurantname', restaurants.getRestaurantByName);
app.get('/restaurants/restaurantLocation/:restaurantlocation', restaurants.getRestaurantByLocation);
app.post('/restaurants', restaurants.createRestaurant);
app.post('/restaurants/:restaurantid', restaurants.updateRestaurant);
app.delete('/restaurants/:restaurantid', restaurants.deleteRestaurant);

// admin: restaurantStaff
app.get('/restaurantstaff/orders/:restaurantstaffid', restaurantstaff.getAllCompletedOrders);
app.get('/restaurantstaff/monthlyOrders/:year/:month/:restaurantstaffid', restaurantstaff.getMonthlyCompletedOrders);
app.get(
  '/restaurantstaff/monthlyStatistics/:year/:month/:restaurantstaffid',
  restaurantstaff.getMonthlyCompletedOrdersStatistics
);
app.get(
  '/restaurantstaff/monthlyFavourites/:year/:month/:restaurantstaffid',
  restaurantstaff.getMonthlyFavouriteFoodItems
);
app.get('/restaurantstaff/promotionStatistics/:restaurantstaffid', restaurantstaff.getPromotionalCampaignsStatistics);
app.post('/restaurantstaff', restaurantstaff.createRestaurantStaff);
app.post('/restaurantstaff/fooditems/:restaurantstaffid', restaurantstaff.createFoodItem);
app.put('/restaurantstaff/:restauranttaffid', restaurantstaff.updateRestaurantStaff);
app.put('/restaurantstaff/fooditems/:restaurantstaffid', restaurantstaff.updateFoodItem);
app.delete('/restaurantstaff/:restaurantstaffid', restaurantstaff.deleteRestaurantStaff);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
