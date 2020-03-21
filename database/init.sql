DROP TABLE IF EXISTS Restaurants CASCADE;
DROP TABLE IF EXISTS FoodItems CASCADE;
DROP TABLE IF EXISTS RestaurantStaff CASCADE;
DROP TABLE IF EXISTS Manages CASCADE;
DROP TABLE IF EXISTS Offers CASCADE;
DROP TABLE IF EXISTS Promotions CASCADE;
DROP TABLE IF EXISTS TargettedPromoCode  CASCADE;
DROP TABLE IF EXISTS Percentage  CASCADE;
DROP TABLE IF EXISTS Amount CASCADE;
DROP TABLE IF EXISTS FreeDelivery CASCADE;
DROP TABLE IF EXISTS FDSManagers CASCADE;
DROP TABLE IF EXISTS Launches CASCADE;
DROP TABLE IF EXISTS DeliveryFee CASCADE;
DROP TABLE IF EXISTS Sets CASCADE;
DROP TABLE IF EXISTS Orders CASCADE;
DROP TABLE IF EXISTS Payments CASCADE;
DROP TABLE IF EXISTS Applies CASCADE;
DROP TABLE IF EXISTS Reviews CASCADE;
DROP TABLE IF EXISTS Contains CASCADE;
DROP TABLE IF EXISTS Customers CASCADE;
DROP TABLE IF EXISTS Requests CASCADE;
DROP TABLE IF EXISTS CreditCards CASCADE;
DROP TABLE IF EXISTS Owns CASCADE;
DROP TABLE IF EXISTS Addresses CASCADE;
DROP TABLE IF EXISTS SavedAddresses CASCADE;
DROP TABLE IF EXISTS RecentAddresses CASCADE;
DROP TABLE IF EXISTS Riders  CASCADE;
DROP TABLE IF EXISTS Rates CASCADE;
DROP TABLE IF EXISTS FTShifts CASCADE;
DROP TABLE IF EXISTS FTDayRanges CASCADE;
DROP TABLE IF EXISTS PTWorkDays CASCADE;
DROP TABLE IF EXISTS PTWorkingHours CASCADE;
DROP TABLE IF EXISTS MWS CASCADE;

CREATE TABLE Promotions (
    promotionID INTEGER PRIMARY KEY,
    startDate DATE, 
    endDate DATE
);

CREATE TABLE TargettedPromoCode (
    promotionID INTEGER PRIMARY KEY REFERENCES Promotions ON DELETE CASCADE,
    promotionDetails VARCHAR(50)
);

CREATE TABLE Percentage (
    promotionID INTEGER primary key references Promotions ON DELETE CASCADE,
    percentageAmount FLOAT
);

CREATE TABLE Amount (
    promotionID INTEGER PRIMARY KEY REFERENCES Promotions ON DELETE CASCADE,
    absoluteAmount FLOAT
);

CREATE TABLE FreeDelivery (
    promotionID INTEGER PRIMARY KEY REFERENCES Promotions ON DELETE CASCADE,
    deliveryAmount FLOAT
);

CREATE TABLE Restaurants (
    restaurantID SERIAL PRIMARY KEY,
    restaurantName VARCHAR(50),
    minOrderCost INTEGER,
    address VARCHAR(100),
    postalCode INTEGER
);

-- Combine Cooks and FoodItems
CREATE TABLE FoodItems (
    foodItemID SERIAL PRIMARY KEY, -- enforces exactly 1
    foodItemName VARCHAR(50), 
    price NUMERIC(6, 2),
    availabilityStatus BOOLEAN,
    image VARCHAR(50),
    maxNumOfOrders INTEGER,
    category VARCHAR(50),
    restaurantID INTEGER NOT NULL, -- enforces exactly 1
    FOREIGN KEY (restaurantID) REFERENCES Restaurants
);

CREATE TABLE RestaurantStaff (
    restaurantStaffID SERIAL PRIMARY KEY,
    restaurantStaffName VARCHAR(50),
    restaurantID INTEGER NOT NULL,
    FOREIGN KEY (restaurantID) REFERENCES Restaurants
);

CREATE TABLE Manages (
    restaurantStaffID INTEGER,
    foodItemID INTEGER,
    PRIMARY KEY (restaurantStaffID, foodItemID),
    FOREIGN KEY (restaurantStaffID) REFERENCES RestaurantStaff,
    FOREIGN KEY (foodItemID) REFERENCES FoodItems
);


CREATE TABLE Offers (
    restaurantID INTEGER REFERENCES Restaurants,
    promotionID INTEGER PRIMARY KEY REFERENCES Promotions
);

CREATE TABLE FDSManagers (
    managerID SERIAL PRIMARY KEY,
    managerName VARCHAR(50)
);

CREATE TABLE Launches (
    managerID INTEGER REFERENCES FDSManagers,
    promotionID INTEGER REFERENCES Promotions,
    PRIMARY KEY (managerID, promotionID)
);

CREATE TABLE DeliveryFee (
    deliveryID SERIAL PRIMARY KEY,
    deliveryFeeAmount NUMERIC(6,2) NOT NULL
);

CREATE TABLE Sets (
    managerID INTEGER REFERENCES FDSManagers,
    deliveryID INTEGER REFERENCES DeliveryFee,
    PRIMARY KEY (managerID, deliveryID)
);

-- Combine Reviews and Posts
CREATE TABLE Reviews(
    reviewID SERIAL,
    reviewImg VARCHAR(50), 
    reviewMsg VARCHAR(256) NOT NULL,
    -- orderID INTEGER UNIQUE,
    PRIMARY KEY (reviewID)
);

-- Combines MonthlySalaries, Riders
-- MonthlySalary = baseSalary and deliveryFees which are based on criteria
CREATE TABLE Riders (
    riderID SERIAL PRIMARY KEY,
    riderName VARCHAR(50),
    riderEmail VARCHAR(50),
    contactNum INTEGER,
    isOccupied BOOLEAN,
    isFullTime BOOLEAN,
    baseSalary INTEGER NOT NULL -- default value?
);

-- combine Orders, Assigns, Charges
CREATE TABLE Orders (
    orderID SERIAL PRIMARY KEY,
    status BOOLEAN,
    orderPlacedTimeStamp TIMESTAMP,
    riderDepartForResTimeStamp TIMESTAMP,
    riderArriveAtResTimeStamp TIMESTAMP,
    riderCollectOrderTimeStamp TIMESTAMP,
    riderDeliverOrderTimeStamp TIMESTAMP,
    specialRequest VARCHAR(256),
    deliveryAddress VARCHAR(100) NOT NULL,
    riderID INTEGER NOT NULL REFERENCES Riders,
    deliveryID INTEGER NOT NULL REFERENCES DeliveryFee
);

CREATE TABLE CreditCards (
    creditCardNumber VARCHAR(16) PRIMARY KEY
);

-- Absorbs PaidBy, Uses
-- Partial Key + Strong entity primary key used to enforce Weak-Entity R/S
-- To enforce TP constraint with Orders, use triggers
-- Triggers: Enforce Only 1 of the 3 booleans is true
CREATE TABLE Payments (
    paymentID SERIAL UNIQUE,
    orderID INTEGER UNIQUE REFERENCES Orders,
    creditCardNumber VARCHAR(16) REFERENCES CreditCards,
    useCash BOOLEAN,
    useCreditCard BOOLEAN,
    useRewardPoints BOOLEAN,
    PRIMARY KEY(paymentID, orderID)
);

CREATE TABLE Applies(
    orderID INTEGER NOT NULL REFERENCES Orders,
    promotionID INTEGER NOT NULL REFERENCES Promotions,
    PRIMARY KEY(orderID,promotionID)
);

CREATE TABLE Contains (
    quantity INTEGER NOT NULL, 
    foodItemID INTEGER REFERENCES FoodItems,
    orderID INTEGER REFERENCES Orders,
    PRIMARY KEY (foodItemID, orderID)
);

CREATE TABLE Customers (
    customerID SERIAL PRIMARY KEY,
    customerName VARCHAR(50) NOT NULL,
    customerEmail VARCHAR(50) UNIQUE NOT NULL,
    customerPassword VARCHAR(50) NOT NULL,
    customerPhone VARCHAR(8) UNIQUE NOT NULL,
    customerAddress VARCHAR(50) NOT NULL,
    customerPostalCode INTEGER NOT NULL,
    rewardPoints INTEGER NOT NULL DEFAULT 0,
    dateCreated DATE NOT NULL
);

CREATE TABLE Requests (
    orderID SERIAL REFERENCES Orders(orderID),
    customerID INTEGER REFERENCES Customers(customerID),
    paymentID INTEGER REFERENCES Payments(paymentID),
    PRIMARY KEY(orderID, customerID)
);

CREATE TABLE Owns (
    customerID SERIAL REFERENCES Customers,
    creditCardNumber VARCHAR(16) REFERENCES CreditCards,
    PRIMARY KEY(customerID, creditCardNumber)
);

-- combine Stores and Addresses
CREATE TABLE Addresses (
    address VARCHAR(100) PRIMARY KEY,
    addressTimeStamp TIMESTAMP NOT NULL,
    customerID INTEGER NOT NULL REFERENCES Customers
);

CREATE TABLE SavedAddresses (
    address VARCHAR(100) PRIMARY KEY REFERENCES Addresses(address) ON DELETE CASCADE
);

CREATE TABLE RecentAddresses (
    address VARCHAR(100) PRIMARY KEY REFERENCES Addresses(address) ON DELETE CASCADE
);

CREATE TABLE Rates (
    customerID INTEGER REFERENCES Customers,
    riderID INTEGER REFERENCES Riders,
    orderID INTEGER REFERENCES Orders, 
    rating INTEGER NOT NULL
);

CREATE TABLE FTDayRanges(
    ftDayRangeID INTEGER PRIMARY KEY,
    ftDayRangeDes VARCHAR(50)
);

CREATE TABLE FTShifts (
    ftShiftID INTEGER PRIMARY KEY,
    ftShiftDes VARCHAR(50)
);

CREATE TABLE PTWorkDays(
    dayOfWeekID VARCHAR(3) PRIMARY KEY,
    dayOfWeekDes VARCHAR(50) NOT NULL
);

CREATE TABLE PTWorkingHours(
    ptWorkingHourID INTEGER PRIMARY KEY,
    ptHourDes VARCHAR(50)
);

CREATE TABLE MWS(
    mwsID INTEGER NOT NULL,
    riderID INTEGER NOT NULL REFERENCES Riders,
    isFullTime BOOLEAN NOT NULL,
    ftDayRangeID INTEGER NOT NULL REFERENCES FTDayRanges,
    dayOfWeekID VARCHAR(3) NOT NULL REFERENCES PTWorkDays,
    ftShiftID INTEGER NOT NULL REFERENCES FTShifts,
    ptWorkingHourID INTEGER NOT NULL REFERENCES PTWorkingHours,
    PRIMARY KEY(mwsID,riderID,ftDayRangeID,dayOfWeekID,ftShiftID,ptWorkingHourID)   
);

-- Format is \copy {sheetname} from '{path-to-file} DELIMITER ',' CSV HEADER;
\copy Restaurants(restaurantID, restaurantName, minOrderCost, address, postalCode) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Restaurants.csv' DELIMITER ',' CSV HEADER;
\copy FoodItems(foodItemID, foodItemName, price, availabilityStatus, image, maxNumOfOrders, category, restaurantID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/FoodItems.csv' DELIMITER ',' CSV HEADER;
\copy RestaurantStaff(restaurantStaffID, restaurantStaffName, restaurantID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/RestaurantStaff.csv' DELIMITER ',' CSV HEADER;
\copy Manages(restaurantStaffID, foodItemID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Manages.csv' DELIMITER ',' CSV HEADER;
\copy Promotions(promotionID, startDate, endDate) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Promotions.csv' DELIMITER ',' CSV HEADER;
\copy Offers(restaurantID, promotionID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Offers.csv' DELIMITER ',' CSV HEADER;
\copy TargettedPromoCode(promotionID, promotionDetails) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/TargettedPromoCode.csv' DELIMITER ',' CSV HEADER;
\copy Percentage(promotionID, percentageAmount) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Percentage.csv' DELIMITER ',' CSV HEADER;
\copy Amount(promotionID, absoluteAmount) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Amount.csv' DELIMITER ',' CSV HEADER;;
\copy FreeDelivery(promotionID, deliveryAmount) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/FreeDelivery.csv' DELIMITER ',' CSV HEADER;
\copy FDSManagers(managerID, managerName) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/FDSManagers.csv' DELIMITER ',' CSV HEADER;
\copy Launches(managerID, promotionID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Launches.csv' DELIMITER ',' CSV HEADER;
\copy DeliveryFee(deliveryID, deliveryFeeAmount) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/DeliveryFee.csv' DELIMITER ',' CSV HEADER;
\copy Reviews(reviewID, reviewImg, reviewMsg) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Reviews.csv' DELIMITER ',' CSV HEADER;
\copy Sets(managerID, deliveryID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Sets.csv' DELIMITER ',' CSV HEADER;
\copy Riders(riderID,riderName,riderEmail,contactNum,isOccupied,isFullTime,baseSalary) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Riders.csv' DELIMITER ',' CSV HEADER;
\copy Orders(orderID, status, orderPlacedTimeStamp, riderDepartForResTimeStamp, riderArriveAtResTimeStamp, riderCollectOrderTimeStamp, riderDeliverOrderTimeStamp, specialRequest, deliveryAddress, riderID, deliveryID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Orders.csv' DELIMITER ',' CSV HEADER;
\copy Applies(orderID, promotionID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Applies.csv' DELIMITER ',' CSV HEADER;
\copy Contains(quantity, foodItemID, orderID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Contains.csv' DELIMITER ',' CSV HEADER;
\copy Customers(customerID, customerName, customerEmail, customerPassword, customerPhone, customerAddress, customerPostalCode, rewardPoints, dateCreated) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Customers.csv' DELIMITER ',' CSV HEADER;
\copy CreditCards(creditCardNumber) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/CreditCards.csv' DELIMITER ',' CSV HEADER;
\copy Payments(paymentID, orderID, creditCardNumber, useCash, useCreditCard, useRewardPoints) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Payments.csv' DELIMITER ',' CSV HEADER; 
\copy Requests(orderID, customerID, paymentID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Requests.csv' DELIMITER ',' CSV HEADER;
\copy Owns(customerID, creditCardNumber) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Owns.csv'DELIMITER ',' CSV HEADER;
\copy Addresses(address, addressTimeStamp, customerID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Addresses.csv' DELIMITER ',' CSV HEADER;
\copy SavedAddresses(address) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/SavedAddresses.csv' DELIMITER ',' CSV HEADER;
\copy RecentAddresses(address) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/RecentAddresses.csv' DELIMITER ',' CSV HEADER;
\copy Rates(customerID, riderID, orderID, rating) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Rates.csv' DELIMITER ',' CSV HEADER;
\copy FTDayRanges(ftDayRangeID, ftDayRangeDes) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/FTDayRanges.csv' DELIMITER ',' CSV HEADER;
\copy FTShifts(ftShiftID, ftShiftDes) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/FTShifts.csv' DELIMITER ',' CSV HEADER;
\copy PTWorkDays(dayOfWeekID, dayOfWeekDes) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/PTWorkDays.csv' DELIMITER ',' CSV HEADER;
\copy PTWorkingHours(ptWorkingHourID, ptHourDes) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/PTWorkingHours.csv' DELIMITER ',' CSV HEADER;
\copy MWS(mwsID, riderID, isFullTime, ftDayRangeID, dayOfWeekID, ftShiftID, ptWorkingHourID) from 'C:/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/MWS.csv' DELIMITER ',' CSV HEADER;

-- Update each `SERIAL` sequence count after .csv insertion 
select setval('restaurants_restaurantid_seq',(select max(restaurantid) from Restaurants));
select setval('fooditems_fooditemid_seq',(select max(fooditemid) from FoodItems));
select setval('restaurantstaff_restaurantstaffid_seq',(select max(restaurantstaffid) from RestaurantStaff));
select setval('fdsmanagers_managerid_seq',(select max(managerid) from FDSManagers));
select setval('deliveryfee_deliveryid_seq',(select max(deliveryid) from DeliveryFee));
select setval('reviews_reviewid_seq',(select max(reviewID) from Reviews));
select setval('riders_riderid_seq',(select max(riderid) from Riders));
select setval('orders_orderid_seq',(select max(orderid) from Orders));
select setval('payments_paymentid_seq',(select max(paymentid) from Payments));
select setval('requests_orderid_seq',(select max(orderid) from Requests));
select setval('customers_customerid_seq',(select max(customerid) from Customers));
select setval('owns_customerid_seq',(select max(customerid) from Owns));
