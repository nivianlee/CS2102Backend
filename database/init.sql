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
    startTimeStamp TIMESTAMP, 
    endTimeStamp TIMESTAMP
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
    availabilityStatus BOOLEAN DEFAULT true,
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
    rewardPoints INTEGER NOT NULL DEFAULT 0,
    dateCreated DATE NOT NULL
);

CREATE TABLE CreditCards (
    customerID INTEGER REFERENCES Customers,
    creditCardNumber VARCHAR(16) UNIQUE,
    creditCardName VARCHAR(50),
    expiryMonth INTEGER check (expiryMonth >= 1 and expiryMonth <= 12),
    expiryYear INTEGER check (expiryYear <= 2100 and expiryYear >= EXTRACT(YEAR FROM CURRENT_DATE)),
    PRIMARY KEY (customerID, creditCardNumber)
);

-- Absorbs PaidBy, Uses
-- Partial Key + Strong entity primary key used to enforce Weak-Entity R/S
-- To enforce TP constraint with Orders, use triggers
-- Triggers: Enforce Only 1 of the 3 booleans is true
CREATE TABLE Payments (
    paymentID SERIAL UNIQUE,
    orderID INTEGER UNIQUE REFERENCES Orders,
    creditCardNumber VARCHAR(16) REFERENCES CreditCards(creditCardNumber),
    useCash BOOLEAN,
    useCreditCard BOOLEAN,
    useRewardPoints BOOLEAN,
    PRIMARY KEY(paymentID, orderID)
);

-- Combine Reviews and Posts
CREATE TABLE Reviews(
    reviewID SERIAL,
    reviewImg VARCHAR(50), 
    reviewMsg VARCHAR(256) NOT NULL,
    customerID INTEGER NOT NULL REFERENCES Customers,
    foodItemID INTEGER NOT NULL REFERENCES FoodItems,
    PRIMARY KEY (reviewID),
    UNIQUE(customerID, foodItemID)
);

CREATE TABLE Requests (
    orderID INTEGER UNIQUE NOT NULL REFERENCES Orders(orderID),
    customerID INTEGER REFERENCES Customers(customerID),
    paymentID INTEGER UNIQUE NOT NULL REFERENCES Payments(paymentID)
);

-- combine Stores and Addresses
CREATE TABLE Addresses (
    addressID SERIAL PRIMARY KEY,
    address VARCHAR(100),
    addressTimeStamp TIMESTAMP NOT NULL,
    postalCode INTEGER NOT NULL,
    customerID INTEGER NOT NULL REFERENCES Customers
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

-- Create triggers after defining schema
CREATE OR REPLACE FUNCTION check_payment_constraint() RETURNS TRIGGER 
	AS $$ 
BEGIN
	IF (NEW.useCash AND NOT NEW.useCreditCard AND NOT NEW.useRewardPoints) THEN 
    RETURN NULL;
	ELSIF NOT NEW.useCash AND NEW.useCreditCard AND NOT NEW.useRewardPoints THEN 
    RETURN NULL;
	ELSIF NOT NEW.useCash AND NOT NEW.useCreditCard AND NEW.useRewardPoints THEN
    RETURN NULL;
	ELSE 
		RAISE exception 'paymentid % cannot have more than 1 payment type set as TRUE', NEW.paymentid;
	END IF;  
END; 
$$ language plpgsql;

DROP TRIGGER IF EXISTS payment_trigger ON Payments CASCADE;
CREATE CONSTRAINT TRIGGER payment_trigger
	AFTER UPDATE OF useCash, useRewardPoints, useCreditCard OR INSERT ON Payments
  FOR EACH ROW 
	EXECUTE FUNCTION check_payment_constraint();

CREATE OR REPLACE FUNCTION check_total_participation_orders_in_contains() RETURNS TRIGGER 
	AS $$ 
DECLARE 
  invalid_order INTEGER;
BEGIN
	SELECT O1.orderid INTO invalid_order
		FROM Orders O1
		WHERE O1.orderid NOT IN
			(SELECT DISTINCT orderid FROM Contains); 

	IF invalid_order IS NOT NULL THEN 
		RAISE exception 'Orderid: % does not exist in Contains ', invalid_order;
	END IF;  
  RETURN NULL;
END; 
$$ language plpgsql;

DROP TRIGGER IF EXISTS contains_trigger ON Contains CASCADE;
CREATE TRIGGER contains_trigger
	AFTER UPDATE OF orderid OR INSERT  
	ON Contains
  	FOR EACH STATEMENT 
    EXECUTE FUNCTION check_total_participation_orders_in_contains();

CREATE OR REPLACE FUNCTION check_total_participation_payments_in_requests() RETURNS TRIGGER 
	AS $$ 
DECLARE 
  invalid_payment INTEGER;
BEGIN
	SELECT P.paymentid INTO invalid_payment
		FROM Payments P
		WHERE P.paymentid NOT IN
			(SELECT DISTINCT paymentid FROM Requests); 

	IF invalid_payment IS NOT NULL THEN 
		RAISE exception 'Paymentid: % does not exist in Requests ', invalid_payment;
	END IF;  
  RETURN NULL;
END; 
$$ language plpgsql;

DROP TRIGGER IF EXISTS payments_in_requests_trigger ON Payments CASCADE;
CREATE TRIGGER payments_in_requests_trigger
	AFTER UPDATE OF paymentid OR INSERT  
	ON Requests
  	FOR EACH STATEMENT 
    EXECUTE FUNCTION check_total_participation_payments_in_requests();

CREATE OR REPLACE FUNCTION check_total_participation_orders_in_requests() RETURNS TRIGGER 
	AS $$ 
DECLARE 
  invalid_order INTEGER;
BEGIN
	SELECT O.orderid INTO invalid_order
		FROM Orders O
		WHERE O.orderid NOT IN
			(SELECT DISTINCT orderid FROM Requests); 

	IF invalid_order IS NOT NULL THEN 
		RAISE exception 'Orderid: % does not exist in Requests ', invalid_order;
	END IF;  
  RETURN NULL;
END; 
$$ language plpgsql;

DROP TRIGGER IF EXISTS orders_in_requests_trigger ON Payments CASCADE;
CREATE TRIGGER orders_in_requests_trigger
	AFTER UPDATE OF orderid OR INSERT  
	ON Requests
  	FOR EACH STATEMENT 
    EXECUTE FUNCTION check_total_participation_orders_in_requests();

-- Ensures that a customer can only review a food item he ordered
CREATE OR REPLACE FUNCTION check_if_customer_ordered_fooditem() RETURNS TRIGGER
    AS $$
DECLARE
    foodItemIDBeingReviewed INTEGER;
BEGIN
    SELECT F.foodItemID INTO foodItemIDBeingReviewed
        FROM Customers C 
        NATURAL JOIN Requests R
        NATURAL JOIN Orders O
        NATURAL JOIN Contains C2
        NATURAL JOIN FoodItems F
        WHERE F.foodItemID = NEW.foodItemID
        AND C.customerID = NEW.customerID
        AND O.status = true;

    IF foodItemIDBeingReviewed IS NULL THEN
        RAISE EXCEPTION 'CustomerID % did not order this food item % ', NEW.customerID, NEW.foodItemID;
    END IF;
    RETURN NEW;
    RETURN NULL;
END;
$$ language plpgsql;

DROP TRIGGER IF EXISTS review_trigger ON Reviews CASCADE;
CREATE TRIGGER review_trigger
    BEFORE INSERT ON Reviews
    FOR EACH ROW
    EXECUTE FUNCTION check_if_customer_ordered_fooditem();

-- Format is \copy {sheetname} from '{path-to-file} DELIMITER ',' CSV HEADER;
\copy Restaurants(restaurantID, restaurantName, minOrderCost, address, postalCode) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Restaurants.csv' DELIMITER ',' CSV HEADER;
\copy FoodItems(foodItemID, foodItemName, price, availabilityStatus, image, maxNumOfOrders, category, restaurantID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/FoodItems.csv' DELIMITER ',' CSV HEADER;
\copy RestaurantStaff(restaurantStaffID, restaurantStaffName, restaurantID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/RestaurantStaff.csv' DELIMITER ',' CSV HEADER;
\copy Manages(restaurantStaffID, foodItemID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Manages.csv' DELIMITER ',' CSV HEADER;
\copy Promotions(promotionID, startTimeStamp, endTimeStamp) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Promotions.csv' DELIMITER ',' CSV HEADER;
\copy Offers(restaurantID, promotionID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Offers.csv' DELIMITER ',' CSV HEADER;
\copy TargettedPromoCode(promotionID, promotionDetails) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/TargettedPromoCode.csv' DELIMITER ',' CSV HEADER;
\copy Percentage(promotionID, percentageAmount) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Percentage.csv' DELIMITER ',' CSV HEADER;
\copy Amount(promotionID, absoluteAmount) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Amount.csv' DELIMITER ',' CSV HEADER;;
\copy FreeDelivery(promotionID, deliveryAmount) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/FreeDelivery.csv' DELIMITER ',' CSV HEADER;
\copy FDSManagers(managerID, managerName) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/FDSManagers.csv' DELIMITER ',' CSV HEADER;
\copy Launches(managerID, promotionID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Launches.csv' DELIMITER ',' CSV HEADER;
\copy DeliveryFee(deliveryID, deliveryFeeAmount) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/DeliveryFee.csv' DELIMITER ',' CSV HEADER;
\copy Sets(managerID, deliveryID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Sets.csv' DELIMITER ',' CSV HEADER;
\copy Riders(riderID,riderName,riderEmail,contactNum,isOccupied,isFullTime,baseSalary) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Riders.csv' DELIMITER ',' CSV HEADER;
\copy Orders(orderID, status, orderPlacedTimeStamp, riderDepartForResTimeStamp, riderArriveAtResTimeStamp, riderCollectOrderTimeStamp, riderDeliverOrderTimeStamp, specialRequest, deliveryAddress, riderID, deliveryID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Orders.csv' DELIMITER ',' CSV HEADER;
\copy Applies(orderID, promotionID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Applies.csv' DELIMITER ',' CSV HEADER;
\copy Contains(quantity, foodItemID, orderID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Contains.csv' DELIMITER ',' CSV HEADER;
\copy Customers(customerID, customerName, customerEmail, customerPassword, customerPhone, rewardPoints, dateCreated) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Customers.csv' DELIMITER ',' CSV HEADER;
\copy CreditCards(customerID, creditCardNumber, creditCardName, expiryMonth, expiryYear) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/CreditCards.csv' DELIMITER ',' CSV HEADER;
\copy Payments(paymentID, orderID, creditCardNumber, useCash, useCreditCard, useRewardPoints) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Payments.csv' DELIMITER ',' CSV HEADER; 
\copy Requests(orderID, paymentID, customerID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Requests.csv' DELIMITER ',' CSV HEADER;
\copy Reviews(reviewID, reviewImg, reviewMsg, customerID, foodItemID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Reviews.csv' DELIMITER ',' CSV HEADER;
\copy Addresses(addressID,address, addressTimeStamp, postalCode, customerID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Addresses.csv' DELIMITER ',' CSV HEADER;
\copy Rates(customerID, riderID, orderID, rating) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/Rates.csv' DELIMITER ',' CSV HEADER;
\copy FTDayRanges(ftDayRangeID, ftDayRangeDes) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/FTDayRanges.csv' DELIMITER ',' CSV HEADER;
\copy FTShifts(ftShiftID, ftShiftDes) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/FTShifts.csv' DELIMITER ',' CSV HEADER;
\copy PTWorkDays(dayOfWeekID, dayOfWeekDes) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/PTWorkDays.csv' DELIMITER ',' CSV HEADER;
\copy PTWorkingHours(ptWorkingHourID, ptHourDes) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/PTWorkingHours.csv' DELIMITER ',' CSV HEADER;
\copy MWS(mwsID, riderID, isFullTime, ftDayRangeID, dayOfWeekID, ftShiftID, ptWorkingHourID) from 'C:/Users/Andy/Desktop/MyProjects/CS2102Backend/database/mock_data/MWS.csv' DELIMITER ',' CSV HEADER;

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
select setval('customers_customerid_seq',(select max(customerid) from Customers));
select setval('addresses_addressid_seq',(select max(addressid) from Addresses));

-- Additional Views
create view TotalCompletedOrders(orderID, orderPlacedTimeStamp, foodItemID, foodItemName, price, quantity, restaurantID) as
SELECT DISTINCT O.OrderID, O.orderPlacedTimeStamp, F.foodItemID, F.foodItemName, F.price, C.quantity, F.restaurantID 
FROM (RestaurantStaff R JOIN FoodItems F ON R.restaurantID = F.restaurantID) 
NATURAL JOIN Contains C 
NATURAL JOIN Orders O 
WHERE O.status = true 
ORDER BY O.orderPlacedTimeStamp DESC;

-- Displays information about the daily number of orders made for every food item.
create view TotalFoodItemsOrderedPerDay(foodItemID, dateOfOrder, numOrdered, availabilityStatus, maxNumOfOrders) as
SELECT DISTINCT F.foodItemID, DATE(O.orderPlacedTimeStamp), sum(quantity) as numOrdered, F.availabilityStatus, F.maxNumOfOrders
FROM FoodItems F left join (Contains C natural join Orders O) using (foodItemID)
GROUP BY (F.foodItemID, DATE(O.orderPlacedTimeStamp)) 
ORDER BY F.foodItemID, DATE(O.orderPlacedTimeStamp);

create view CustPerMonth(month, year, numCustCreated) as
    (SELECT to_char(to_timestamp(res.month::text,'MM'), 'Mon') as month, year, numCustCreated  
    FROM (SELECT extract(month from dateCreated) as month,
                extract(year from dateCreated) as year, 
                count(*) as numCustCreated
            FROM Customers C 
            GROUP BY 1, 2 
            ORDER BY year, month) as res);

create view OrderCosts(orderid,totalCostOfOrder) as
       (select orderid, sum(price*quantity) as totalCostOfOrder
        from contains join fooditems using (fooditemid) 
        group by orderid 
        order by orderid);

create view TotalCostPerMonth(month, year, totalOrders, totalOrdersSum) as 
        (SELECT to_char(to_timestamp(res.month::text, 'MM'), 'Mon') as month, year, totalOrders, totalOrdersSum
         FROM (SELECT extract(month from O.orderplacedtimestamp::date) as month,
                      extract(year from O.orderplacedtimestamp::date) as year,
                      count(*) as totalOrders,
                      sum(totalCostOfOrder) as totalOrdersSum
               FROM Orders O join OrderCosts using (orderid) 
               GROUP BY 1, 2
               ORDER BY year, month) as res);

/* Additional triggers that can only be created after mock data is inserted */

-- Sets food availability to false if max number is met and no exception raised.
-- Assumes that insertion of new rows in Orders and Contains are done atomically.
CREATE OR REPLACE FUNCTION check_food_availability() RETURNS TRIGGER 
    AS $$
DECLARE
    selectedFoodItemID  INTEGER;
BEGIN
    SELECT T.foodItemID INTO selectedFoodItemID
    FROM TotalFoodItemsOrderedPerDay T
    WHERE T.numOrdered > T.maxNumOfOrders
    OR T.availabilityStatus = false;

    IF selectedFoodItemID IS NOT NULL THEN
        RAISE EXCEPTION 'Food item ordered is either unavailable or amount ordered is not allowed';
    ELSE
        update FoodItems
        set availabilityStatus = false
        where foodItemID = (
            SELECT T.foodItemID
            FROM TotalFoodItemsOrderedPerDay T
            WHERE T.foodItemID = foodItemID
            AND T.dateOfOrder >= ALL (
                SELECT T2.dateOfOrder
                FROM TotalFoodItemsOrderedPerDay T2
                WHERE T.foodItemID = T2.foodItemID
            )
            AND T.numOrdered = T.maxNumOfOrders
        );
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_new_contains_trigger ON Contains CASCADE;
CREATE TRIGGER after_new_contains_trigger 
    AFTER INSERT ON Contains
    FOR EACH ROW EXECUTE FUNCTION check_food_availability();

-- Resets food availability before the first order of the day.
CREATE OR REPLACE FUNCTION reset_food_availability() RETURNS TRIGGER
    AS $$
DECLARE
    mostRecentTimeStamp TIMESTAMP;
BEGIN
    SELECT O.orderPlacedTimeStamp INTO mostRecentTimeStamp
    FROM Orders O
    WHERE O.orderID + 1 = NEW.orderID
    AND DATE(O.orderPlacedTimeStamp) = DATE(NEW.orderPlacedTimeStamp);

    IF mostRecentTimeStamp IS NULL THEN
        update FoodItems
        set availabilityStatus = true;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_new_orders_trigger ON Orders CASCADE;
CREATE TRIGGER after_new_orders_trigger 
    AFTER INSERT ON Orders
    FOR EACH ROW EXECUTE FUNCTION reset_food_availability();
