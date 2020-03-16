DROP TABLE IF EXISTS Restaurants CASCADE;
DROP TABLE IF EXISTS FoodItems CASCADE;
DROP TABLE IF EXISTS RestaurantStaff CASCADE;
DROP TABLE IF EXISTS Manages CASCADE;
DROP TABLE IF EXISTS Offers CASCADE;
DROP TABLE IF EXISTS Promotions CASCADE;
DROP TABLE IF EXISTS TargettedPromoCode CASCADE;
DROP TABLE IF EXISTS Percentage CASCADE;
DROP TABLE IF EXISTS Amount CASCADE;
DROP TABLE IF EXISTS FreeDelivery CASCADE;
DROP TABLE IF EXISTS FDSManagers CASCADE;
DROP TABLE IF EXISTS Launches CASCADE;
DROP TABLE IF EXISTS DeliveryFee CASCADE;
DROP TABLE IF EXISTS Sets CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS Applies CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS Contains CASCADE;
DROP TABLE IF EXISTS Charges CASCADE;
DROP TABLE IF EXISTS Customers CASCADE;
DROP TABLE IF EXISTS Requests CASCADE;
DROP TABLE IF EXISTS CreditCards CASCADE;
DROP TABLE IF EXISTS Owns CASCADE;
DROP TABLE IF EXISTS Addresses CASCADE;
DROP TABLE IF EXISTS SavedAddresses CASCADE;
DROP TABLE IF EXISTS RecentAddresses CASCADE;
DROP TABLE IF EXISTS Stores CASCADE;
DROP TABLE IF EXISTS Riders CASCADE;
DROP TABLE IF EXISTS Rates CASCADE;

CREATE TABLE Restaurants (
    restaurantID SERIAL PRIMARY KEY,
    restaurantName VARCHAR(50),
    minOrderCost INTEGER,
    address VARCHAR(100),
    postalCode INTEGER
);

-- Combines Cooks and FoodItems
CREATE TABLE FoodItems (
    foodItemID SERIAL PRIMARY KEY, -- enforces exactly 1
    foodItemName VARCHAR(50), 
    price NUMERIC(6, 2),
    availabilityStatus BOOLEAN,
    image VARCHAR(50),
    maxNumOfOrders INTEGER,
    category VARCHAR(50),
    restaurantID SERIAL NOT NULL, -- enforces exactly 1
    FOREIGN KEY (restaurantID) REFERENCES Restaurants
);

CREATE TABLE RestaurantStaff (
    restaurantStaffID SERIAL PRIMARY KEY,
    restaurantStaffName VARCHAR(50)
    restaurantID SERIAL NOT NULL
    FOREIGN KEY (restaurantID) REFERENCES Restaurants
);

CREATE TABLE Manages (
    restaurantStaffID SERIAL,
    foodItemID SERIAL,
    PRIMARY KEY (restaurantStaffID, foodItemID),
    FOREIGN KEY (restaurantStaffID ) REFERENCES RestaurantStaff,
    FOREIGN KEY (foodItemID ) REFERENCES FoodItems
);

CREATE TABLE Offers (
    restaurantID SERIAL REFERENCES Restaurants,
    promotionID SERIAL PRIMARY KEY REFERENCES Promotions
);

CREATE TABLE Promotions (
    promotionID SERIAL PRIMARY KEY,
    startDate DATE,	
    endDate DATE
);

CREATE TABLE TargettedPromoCode (
    promotionID SERIAL PRIMARY KEY REFERENCES Promotions ON DELETE CASCADE,
    promotionDetails VARCHAR(50)
);

CREATE TABLE Percentage (
    promotionID SERIAL primary key references Promotions ON DELETE CASCADE,
    percentageAmount FLOAT
);

CREATE TABLE Amount (
    promotionID SERIAL PRIMARY KEY REFERENCES Promotions ON DELETE CASCADE,
    absoluteAmount FLOAT
);

CREATE TABLE FreeDelivery (
    promotionID SERIAL PRIMARY KEY REFERENCES Promotions ON DELETE CASCADE,
    deliveryAmount FLOAT
);

CREATE TABLE FDSManagers (
    managerID SERIAL PRIMARY KEY,
    managerName VARCHAR(50)
);

CREATE TABLE Launches (
    managerID SERIAL REFERENCES FDSManagers,
    promotionID SERIAL REFERENCES Promotions,
    PRIMARY KEY (managerID, promotionID)
);

CREATE TABLE DeliveryFee (
    deliveryID SERIAL PRIMARY KEY,
    deliveryFeeAmount FLOAT
);

CREATE TABLE Sets (
    managerID SERIAL REFERENCES FDSManagers,
    deliveryID SERIAL REFERENCES DeliveryFee,
    PRIMARY KEY (managerID, deliveryID)
);

-- Combines Orders, Assigns
CREATE TABLE Orders (
    orderID SERIAL PRIMARY KEY,
    status BOOLEAN,
    orderPlacedTimeStamp TIMESTAMP,
    riderDepartForResTimeStamp TIMESTAMP,
    riderArriveAtResTimeStamp TIMESTAMP,
    riderCollectOrderTimeStamp TIMESTAMP,
    riderDeliverOrderTimeStamp TIMESTAMP,
    specialRequest VARCHAR(100),
    deliveryAddress VARCHAR(100) NOT NUll,
    reviewID SERIAL UNIQUE REFERENCES Reviews,
    riderID SERIAL UNIQUE NOT NULL REFERENCES Riders
);

CREATE TABLE Applies (
    orderID INTEGER NOT NULL REFERENCES Orders,
    promotionID INTEGER NOT NULL REFERENCES Promotions,
    PRIMARY KEY (orderID, promotionID)
);

-- Combine Reviews and Posts
CREATE TABLE Reviews(
    reviewID SERIAL,
    reviewImg VARCHAR(50), 
    reviewMsg VARCHAR(256) NOT NULL,
    PRIMARY KEY (reviewID)
);

CREATE TABLE Contains (
    quantity INTEGER NOT NULL, 
    foodItemID SERIAL REFERENCES FoodItems,
    orderID SERIAL REFERENCES Orders,
    PRIMARY KEY (foodItemID, orderID)
);

CREATE TABLE Charges (
    deliveryFeeAmount NUMERIC(6,2),
    deliveryID SERIAL REFERENCES DeliveryFee,
    orderID SERIAL REFERENCES Orders,
    PRIMARY KEY (foodItemID, orderID)
);

CREATE TABLE Customers (
    customerId SERIAL PRIMARY KEY,
    customerName VARCHAR(50) NOT NULL,
    customerEmail VARCHAR(50) UNIQUE NOT NULL,
    customerPassword VARCHAR(50) NOT NULL,
    customerPhone VARCHAR(8) UNIQUE NOT NULL,
    customerAddress VARCHAR(50) NOT NULL,
    customerPostalCode INTEGER NOT NULL,
    rewardPoints INTEGER NOT NULL DEFAULT 0,
    dateCreated DATE
);


CREATE TABLE Requests (
    orderID REFERENCES Orders,
    customerID REFERENCES Customers,
    creditCardNumber REFERENCES CreditCards,
    PRIMARY KEY(orderID, customerID)
);
CREATE TABLE CreditCards (
    creditCardNumber INTEGER PRIMARY KEY,
);

CREATE TABLE Owns (
    customerID SERIAL REFERENCES Customers,
    creditCardNumber INTEGER REFERENCES CreditCards,
    PRIMARY KEY(customerID, creditCardNumber)
);

CREATE TABLE Addresses (
    address VARCHAR(100) PRIMARY KEY,
    addressTimeStamp TIMESTAMP
);

CREATE TABLE SavedAddresses (
    address VARCHAR(100) PRIMARY KEY REFERENCES Addresses ON DELETE CASCADE
);

CREATE TABLE RecentAddresses (
    address VARCHAR(100) PRIMARY KEY REFERENCES Addresses ON DELETE CASCADE
);

CREATE TABLE Stores (
    customerID SERIAL REFERENCES Customers,
    address VARCHAR(100) REFERENCES Addresses,
    PRIMARY KEY(customerID, address)
);

-- Combines MonthlySalaries and Riders
-- MonthlySalary = baseSalary and deliveryFees which are based on criteria
CREATE TABLE Riders (
    baseSalary INTEGER NOT NULL -- default value?
    riderID SERIAL PRIMARY KEY,
    riderEmail VARCHAR(50),
    riderName VARCHAR(50),
    contactNum INTEGER,
    isOccupied BOOLEAN,
    isFullTime BOOLEAN
);

CREATE TABLE Rates (
    customerID SERIAL REFERENCES Customers,
    riderID SERIAL REFERENCES Riders,
    orderID SERIAL PRIMARY KEY 
);

-- Format is \copy {sheetname} from '{path-to-file} DELIMITER ',' CSV HEADER;
\copy Restaurants(restaurantID, restaurantName, minOrderCost, address, postalCode) from 'Restaurants.csv' DELIMITER ',' CSV HEADER;
\copy FoodItems(foodItemID, foodItemName, price, availabilityStatus, image, maxNumOfOrders, category, restaurantID) from 'FoodItems.csv' DELIMITER ',' CSV HEADER;
\copy RestaurantStaff(restaurantStaffID, restaurantStaffName, restaurantID) from 'RestaurantStaff.csv' DELIMITER ',' CSV HEADER;
\copy Manages(restaurantStaffID, foodItemID) from 'Manages.csv' DELIMITER ',' CSV HEADER;
\copy Offers(restaurantID, promotionID) from 'Offers.csv' DELIMITER ',' CSV HEADER;
\copy Promotions(promotionID, startDate, endDate) from 'Promotions.csv' DELIMITER ',' CSV HEADER;
\copy TargettedPromoCode(promotionID, promotionDetails) from 'TargettedPromoCode.csv' DELIMITER ',' CSV HEADER;
\copy Percentage(promotionID, percentageAmount) from 'Percentage.csv' DELIMITER ',' CSV HEADER;
\copy Amount(promotionID, absoluteAmount) from 'Amount.csv' DELIMITER ',' CSV HEADER;;
\copy FreeDelivery(promotionID, deliveryAmount) from 'FreeDelivery.csv' DELIMITER ',' CSV HEADER;
\copy FDSManagers(managerID, managerName) from 'FDSManagers.csv' DELIMITER ',' CSV HEADER;
\copy Launches(managerID, promotionID) from 'Launches.csv' DELIMITER ',' CSV HEADER;
\copy DeliveryFee(deliveryID, deliveryFeeAmount) from 'DeliveryFee.csv' DELIMITER ',' CSV HEADER;
\copy Sets(managerID, deliveryID) from 'Sets.csv' DELIMITER ',' CSV HEADER;
\copy Orders(orderID, status, orderPlacedTimeStamp, riderDepartForResTimeStamp, riderArriveAtResTimeStamp, riderCollectOrderTimeStamp, riderDeliverOrderTimeStamp, specialRequest, deliveryAddress, reviewID, riderID) from 'Orders.csv' DELIMITER ',' CSV HEADER;
\copy Applies(orderID, promotionID) from 'Applies.csv' DELIMITER ',' CSV HEADER;
\copy Reviews(reviewID, reviewImg, reviewMsg) from 'Reviews.csv' DELIMITER ',' CSV HEADER;
\copy Contains(quantity, foodItemID, orderID) from 'Contains.csv' DELIMITER ',' CSV HEADER;
\copy Charges(deliveryFeeAmount, deliveryID, orderID) from 'Charges.csv' DELIMITER ',' CSV HEADER;
\copy Customers(customerID, customerName, customerEmail, customerPassword, customerPhone, customerAddress, customerPostalCode, rewardPoints, dateCreated) from 'Customers.csv' DELIMITER ',' CSV HEADER;
\copy Requests(orderID, customerID, creditCardNumber) from 'Requests.csv' DELIMITER ',' CSV HEADER;
\copy CreditCards(creditCardNumber) from 'CreditCards.csv' DELIMITER ',' CSV HEADER;
\copy Owns(customerID, creditCardNumber) from 'Owns.csv'DELIMITER ',' CSV HEADER;
\copy Addresses(address, addressTimeStamp) from 'Addresses.csv' DELIMITER ',' CSV HEADER;
\copy SavedAddresses(address) from 'SavedAddresses.csv' DELIMITER ',' CSV HEADER;
\copy RecentAddresses(address) from 'RecentAddresses.csv' DELIMITER ',' CSV HEADER;
\copy Stores(customerID, address) from 'Stores.csv' DELIMITER ',' CSV HEADER;
\copy Riders(baseSalary, riderID, riderEmail, riderName, contactNum, isOccupied, isFullTime) from 'Riders.csv' DELIMITER ',' CSV HEADER;
\copy Rates(customerID, riderID, orderID) from 'Rates.csv' DELIMITER ',' CSV HEADER; 