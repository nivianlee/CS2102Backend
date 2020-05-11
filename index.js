const express = require('express');
const bodyParser = require('body-parser');
const customers = require('./api/customer/customers');
const accounts = require('./api/admin/accounts');
const fdsManagers = require('./api/admin/fdsmanagers');
const restaurants = require('./api/admin/restaurants');
const restaurantstaff = require('./api/admin/restaurantstaff');
const riders = require('./api/admin/riders');
const foodItems = require('./api/common/fooditems');
const promotions = require('./api/common/promotions');
const app = express();
const port = 3000;
const mws = require('./api/admin/mws');

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

app.get('/customers', customers.getCustomers); // CFE don't need
app.get('/customers/customer/:customerid', customers.getCustomerById); // CFE done
app.post('/customers', customers.createCustomer); // CFE done
app.put('/customers/customer/:customerid', customers.updateCustomer);
app.delete('/customers/customer/:customerid', customers.deleteCustomer); // CFE don't need

app.get('/customers/addresses/:customerid', customers.getAddresses); // CFE done
app.post('/customers/addresses/:customerid', customers.postAddress); // CFE done
app.put('/customers/addresses/:customerid', customers.updateAddress); // CFE done
app.delete('/customers/addresses/:addressid', customers.deleteAddress); // CFE done

app.get('/customers/currentorders/:customerid', customers.getCurrentOrders);
app.get('/customers/pastorders/:customerid', customers.getPastOrders);
app.get('/customers/:customerid/order/:orderid', customers.getAnOrderByCusIdNOrderId);
app.get('/customers/:customerid/orders', customers.getPastOrdersWithRes);
app.post('/customers/orders', customers.postOrder);

app.get('/customers/reviews', customers.getAllReviews);
app.get('/customers/reviews/fooditem/:fooditemid', customers.getReviewsForFoodItem);
app.get('/customers/:customerid/reviews/fooditem/:fooditemid', customers.getReviewForFoodItem);
app.get('/customers/reviews/restaurant/:restaurantid', customers.getFoodItemReviewsByRestaurantID);

app.post('/customers/reviews/:customerid', customers.postReview);
app.put('/customers/reviews/:customerid', customers.updateReview);
app.delete('/customers/reviews/:customerid', customers.deleteReview);

app.get('/customers/creditcards/:customerid', customers.getCustomerCreditCards); // CFE done
app.get('/customers/creditcard/:customerid/:creditcardid', customers.getCustomerCreditCard); // CFE done
app.post('/customers/creditcard/:customerid', customers.addCustomerCreditCard); // CFE done
app.put('/customers/creditcard/:customerid', customers.updateCustomerCreditCard); // CFE done
app.delete('/customers/creditcard/:customerid', customers.deleteCustomerCreditCard); // CFE done

app.post('/customers/rider/:customerid', customers.rateRider);

// restaurant apis
app.get('/restaurants', restaurants.getRestaurants); // CFE done

// fooditems apisd
app.get('/fooditems', foodItems.getFoodItems);
app.get('/fooditems/:restaurantid', foodItems.getFoodItemsByRestaurantId); // CFE done

// promotions apis
app.get('/promotions', promotions.getPromotions);
app.get('/promotions/customer', promotions.getPromotionsNotNull);
app.get('/promotions/:promotionid', promotions.getPromotionsByID);
app.get('/promotions/restaurant/:restaurantid', promotions.getPromotionsByRestaurantID);
app.get(
  '/promotions/generalandrestaurantpromotion/:restaurantid',
  promotions.getGeneralPromotionsAndPromotionsByRestaurantID
);

// admin: accounts
app.post('/admin/login', accounts.login);

// admin: fdsManagers
app.get('/fdsManagers/summaryOne', fdsManagers.getFDSManagerSummaryOne);
app.get('/fdsManagers/summaryTwo', fdsManagers.getFDSManagerSummaryTwo);
app.get('/fdsManagers/summaryTwoByCustomerId/:customerid', fdsManagers.getFDSManagerSummaryTwoByCustomerId);
app.get('/fdsManagers/summaryThree', fdsManagers.getFDSManagerSummaryThree);
app.get('/fdsManagers/summaryFour', fdsManagers.getFDSManagerSummaryFour);
app.get('/fdsManagers/summaryFourByRiderId/:riderid', fdsManagers.getFDSManagerSummaryFourByRiderId);
app.get('/fdsManagers', fdsManagers.getFDSManagers);
app.get('/fdsManagers/:managerid', fdsManagers.getFDSManagerById);
app.post('/fdsManagers', fdsManagers.createFDSManager);
app.post('/fdsManagers/:managerid', fdsManagers.updateFDSManager);
app.post('/fdsManagers/:managerid/promotion', fdsManagers.postPromotion);
app.delete('/fdsManagers/:managerid', fdsManagers.deleteFDSManager);

// admin: MWS for PartTimeSchedules and FullTimeSchedules
app.get('/shifts', mws.getShiftsTable);
app.get('/mws', mws.getMwsFullTimeRiders);
app.get('/mws/:riderid/', mws.getMwsFullTimeRiderById);
app.get('/mws/:riderid/:monthid', mws.getMwsFullTimeRiderByMonth);
app.get('/wws', mws.getWwsPartTimeRiders);
app.get('/wws/:riderid/', mws.getWwsPartTimeRiderById);
app.get('/wws/:riderid/:monthid', mws.getWwsPartTimeRiderByMonth);
app.post('/mws', mws.createMwsFullTimeRider);
app.post('/wws', mws.createWwsPartTimeRider);
app.post('/mws/update', mws.updateMwsFullTimeRider);
app.post('/wws/update', mws.updateWwsPartTimeRider);
app.delete('/mws', mws.deleteMwsFullTimeRiderByMonth);
app.delete('/wws', mws.deleteWwsPartTimeRiderByWeek);

// admin: restaurant
app.get('/restaurants', restaurants.getRestaurants);
app.get('/restaurants/:restaurantid', restaurants.getRestaurantById);
app.get('/restaurants/restaurantName/:restaurantname', restaurants.getRestaurantByName);
app.get('/restaurants/restaurantLocation/:restaurantlocation', restaurants.getRestaurantByLocation);
app.post('/restaurants', restaurants.createRestaurant);
app.post('/restaurants/:restaurantid', restaurants.updateRestaurant);
app.delete('/restaurants/:restaurantid', restaurants.deleteRestaurant);

// admin: restaurantStaff
app.get('/restaurants/:restaurantid/restaurantstaff', restaurantstaff.getRestaurantStaffs);
app.get('/restaurants/:restaurantid/restaurantstaff/:restaurantstaffid', restaurantstaff.getRestaurantStaffById);
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
app.put('/restaurantstaff/:restaurantstaffid', restaurantstaff.updateRestaurantStaff);
app.post('/restaurantstaff/:restaurantstaffid/fooditems', restaurantstaff.createFoodItem);
app.post('/restaurantstaff/:restaurantstaffid/promotion', restaurantstaff.postPromotion);
app.put('/restaurantstaff/:restaurantstaffid/fooditems', restaurantstaff.updateFoodItem);
app.delete('/restaurantstaff/:restaurantstaffid/fooditems', restaurantstaff.deleteFoodItem);
app.delete('/restaurantstaff/:restaurantstaffid', restaurantstaff.deleteRestaurantStaff);

// admin: riders
app.get('/riders', riders.getRiders);
app.get('/riders/:riderid', riders.getRiderById);
app.get('/riders/:riderid/getOrdersByRiderId', riders.getOrdersByRiderId);
app.get('/riders/:riderid/getAllRidersSummary', riders.getAllRidersSummary); // riderid is not required here
app.get('/riders/:riderid/getRiderSummaryById', riders.getRiderSummaryById);
app.get('/riders/:riderid/ratings', riders.getRatingsByRiderId);
app.post('/riders', riders.createRider);
app.put('/riders/:riderid', riders.updateRider);
app.post('/riders/toggleOrderTimestamp', riders.toggleUpdateRiderOrderTimestamp);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
