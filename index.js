const express = require("express");
const bodyParser = require("body-parser");
const customers = require("./api/customer/customers");
const fdsManagers = require("./api/admin/fdsmanagers");
const restaurants = require("./api/admin/restaurants");
const restaurantstaff = require("./api/admin/restaurantstaff");
const foodItems = require("./api/common/fooditems");
const promotions = require("./api/common/promotions");
const app = express();
const port = 3000;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.get("/", (request, response) => {
  response.json({
    info: "Node.js, Express, and Postgres API",
  });
});

// customer apis
app.get("/customers", customers.getCustomers);
app.get("/customers/customerid/:customerid", customers.getCustomerById);
app.get("/customers/addresses/:customerid", customers.getAddresses);
app.get("/customers/recentaddresses/:customerid", customers.getRecentAddresses);
app.get("/customers/savedaddresses/:customerid", customers.getSavedAddresses);
app.get("/customers/currentorders/:customerid", customers.getCurrentOrders);
app.get("/customers/pastorders/:customerid", customers.getPastOrders);
app.get("/customers/reviews", customers.getAllReviews);
app.get("/customers/reviews/:fooditemid", customers.getReviewsForFoodItem);
app.post("/customers", customers.createCustomer);
app.post("/customers/reviews", customers.postReview);
app.put("/customers/customerid/:customerid", customers.updateCustomer);
app.put("/customers/reviews", customers.updateReview);
app.delete("/customers/customerid/:customerid", customers.deleteCustomer);
app.delete("/customers/reviews", customers.deleteReview);

// fooditems apis
app.get("/fooditems", foodItems.getFoodItems);
app.get("/fooditems/:restaurantid", foodItems.getFoodItemsByRestaurantId);
app.get("/promotions", promotions.getPromotions);
app.get("/promotions/:promotionid", promotions.getPromotionsByID);

// admin: fdsManagers
app.get("/fdsManagers/summaryOne", fdsManagers.getFDSManagerSummaryOne);
app.get("/fdsManagers/summaryTwo", fdsManagers.getFDSManagerSummaryTwo);
app.get("/fdsManagers/summaryThree", fdsManagers.getFDSManagerSummaryThree);
app.get("/fdsManagers/summaryFour", fdsManagers.getFDSManagerSummaryFour);
app.get("/fdsManagers", fdsManagers.getFDSManagers);
app.get("/fdsManagers/:managerid", fdsManagers.getFDSManagersById);
app.post("/fdsManagers", fdsManagers.createFDSManagers);
app.post("/fdsManagers/:managerid", fdsManagers.updateFDSManagers);
app.delete("/fdsManagers/:managerid", fdsManagers.deleteFDSManagers);

// admin: restaurant
app.get("/restaurants", restaurants.getRestaurants);
app.get("/restaurants/:restaurantid", restaurants.getRestaurantById);
app.get(
  "/restaurants/restaurantName/:restaurantname",
  restaurants.getRestaurantByName
);
app.get(
  "/restaurants/restaurantLocation/:restaurantlocation",
  restaurants.getRestaurantByLocation
);
app.post("/restaurants", restaurants.createRestaurant);
app.post("/restaurants/:restaurantid", restaurants.updateRestaurant);
app.delete("/restaurants/:restaurantid", restaurants.deleteRestaurant);

// admin: restaurantStaff
app.get(
  "/restaurantstaff/orders/:restaurantstaffid",
  restaurantstaff.getAllCompletedOrders
);
app.get(
  "/restaurantstaff/monthlyOrders/:year/:month/:restaurantstaffid",
  restaurantstaff.getMonthlyCompletedOrders
);
app.get(
  "/restaurantstaff/monthlyStatistics/:year/:month/:restaurantstaffid",
  restaurantstaff.getMonthlyCompletedOrdersStatistics
);
app.get(
  "/restaurantstaff/monthlyFavourites/:year/:month/:restaurantstaffid",
  restaurantstaff.getMonthlyFavouriteFoodItems
);
app.get(
  "/restaurantstaff/promotionStatistics/:restaurantstaffid",
  restaurantstaff.getPromotionalCampaignsStatistics
);
app.post("/restaurantstaff", restaurantstaff.createRestaurantStaff);
app.post(
  "/restaurantstaff/fooditems/:restaurantstaffid",
  restaurantstaff.createFoodItem
);
app.put(
  "/restaurantstaff/:restauranttaffid",
  restaurantstaff.updateRestaurantStaff
);
app.put(
  "/restaurantstaff/fooditems/:restaurantstaffid",
  restaurantstaff.updateFoodItem
);
app.delete(
  "/restaurantstaff/:restaurantstaffid",
  restaurantstaff.deleteRestaurantStaff
);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
