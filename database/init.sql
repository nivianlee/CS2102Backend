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
DROP TABLE IF EXISTS Addresses CASCADE;
DROP TABLE IF EXISTS Riders  CASCADE;
DROP TABLE IF EXISTS Rates CASCADE;
DROP TABLE IF EXISTS PartTimeSchedules CASCADE;
DROP TABLE IF EXISTS FullTimeSchedules CASCADE;
DROP TABLE IF EXISTS DayRanges CASCADE;
DROP TABLE IF EXISTS Shifts CASCADE;

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
    minOrderCost NUMERIC(6, 2),
    contactNum INTEGER,
    address VARCHAR(100),
    postalCode INTEGER,
    image VARCHAR
);

-- Combine Cooks and FoodItems
CREATE TABLE FoodItems (
    foodItemID SERIAL PRIMARY KEY, -- enforces exactly 1
    foodItemName VARCHAR(50), 
    price NUMERIC(6, 2),
    availabilityStatus BOOLEAN DEFAULT true,
    image VARCHAR,
    maxNumOfOrders INTEGER,
    category VARCHAR(50),
    restaurantID INTEGER NOT NULL, -- enforces exactly 1
    FOREIGN KEY (restaurantID) REFERENCES Restaurants
);

CREATE TABLE RestaurantStaff (
    restaurantStaffID SERIAL PRIMARY KEY,
    restaurantStaffName VARCHAR(50),
    contactNum INTEGER UNIQUE NOT NULL,
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
    managerName VARCHAR(50),
    contactNum INTEGER UNIQUE NOT NULL
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
    customerID INTEGER REFERENCES Customers(customerID),
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
    reviewImg VARCHAR, 
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

CREATE TABLE DayRanges(
    rangeID INTEGER PRIMARY KEY,
    range INTEGER ARRAY NOT NULL UNIQUE
);

CREATE TABLE Shifts(
    shiftID INTEGER PRIMARY KEY,
    shiftOneStart TIME NOT NULL,
    shiftOneEnd TIME NOT NULL,
    shiftTwoStart TIME NOT NULL,
    shiftTwoEnd TIME NOT NULL
);

-- Weak entity wrt to PartTime riders
-- Partial Key: startTime, endTime, week, day
-- Absorbs Has relationship wrt to PartTime riders to enforce exactly one  
CREATE TABLE PartTimeSchedules(
    riderID INTEGER REFERENCES Riders ON DELETE CASCADE,
    startTime TIME NOT NULL,
    endTime TIME NOT NULL,
    week INTEGER NOT NULL, -- 1 <= week <= 52
    day INTEGER NOT NULL, -- 1 <= day <= 7
    PRIMARY KEY(riderID, startTime, endTime, week, day) -- references strong entity's pkey riderID 
);

-- Weak entity wrt to FullTime riders 
-- Partial key: month
-- Absorbs Uses relation on Shifts and DayRanges to enforce exactly one
CREATE TABLE FullTimeSchedules(
    riderID INTEGER REFERENCES Riders ON DELETE CASCADE,
    shiftID INTEGER REFERENCES Shifts,
    rangeID INTEGER REFERENCES DayRanges,
    month INTEGER NOT NULL,
    PRIMARY KEY(riderID, month) -- references strong entity's pkey riderID
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

DROP TRIGGER IF EXISTS payments_in_requests_trigger ON Requests CASCADE;
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

DROP TRIGGER IF EXISTS orders_in_requests_trigger ON Requests CASCADE;
CREATE TRIGGER orders_in_requests_trigger
	AFTER UPDATE OF orderid OR INSERT  
	ON Requests
  	FOR EACH STATEMENT 
    EXECUTE FUNCTION check_total_participation_orders_in_requests();

CREATE OR REPLACE FUNCTION check_at_least_five_riders_in_hour_interval() RETURNS TRIGGER
  AS $$ 
DECLARE
  numPartTimeInHour INTEGER;
  numFullTimeInHour INTEGER;
  time_hour_string VARCHAR(20);
  m INTEGER;
  weeks INTEGER ARRAY;
  w INTEGER;
BEGIN
  SELECT ARRAY(SELECT DISTINCT week FROM PartTimeSchedules) INTO weeks;
  -- Need to ensure all months MWS and corresponding weeks' WWS exist 
  FOREACH w IN ARRAY weeks LOOP -- weeks do exist, check all weeks
    m := CEILING(w / 4::float); -- month may not exist in 
    FOR d IN 1..7 LOOP -- Iterate through each day 
      FOR hour IN 10..21 LOOP -- Iterate through each hour, exclude 2200 because work hours stop after 2200
        numPartTimeInHour := 0;
        numFullTimeInHour := 0;
        time_hour_string := to_char(hour, '99') || ':00:00'; 

        -- In PartTimeSchedules, match by day then check if the hour lies in any of the startTime, endTime ranges. 
        -- Count tuples that meet requirements. 
        SELECT COUNT(*) INTO numPartTimeInHour 
        FROM PartTimeSchedules P
        WHERE d = P.day and w = P.week
        AND (time_hour_string::time, time_hour_string::time) OVERLAPS (startTime, endTime);

        -- In FullTimeSchedules match by month, then day in range, check if hour lies in any of the shift ranges -- use overlaps  
        -- Count tuples that meet requirements.
        SELECT COUNT(*) INTO numFullTimeInHour
        FROM FullTimeSchedules F 
          JOIN Shifts using (shiftID)
          JOIN DayRanges using (rangeID)
        WHERE m = F.month
        AND (SELECT d = ANY(range))
        AND (
            (time_hour_string::time, time_hour_string::time) OVERLAPS (shiftOneStart, shiftOneEnd)
            OR 
            (time_hour_string::time, time_hour_string::time) OVERLAPS (shiftTwoStart, shiftTwoEnd)
          );

        IF (numFullTimeInHour + numPartTimeInHour) < 5 THEN 
          RAISE exception 'Month % Week % Day % at Hour % does not have at least 5 riders', m, w, d, hour; 
        END IF;
      END LOOP; 
    END LOOP;
  END LOOP;
  RETURN NULL;
END; 
$$ language plpgsql; 

DROP TRIGGER IF EXISTS full_time_riders_participation_in_hour_interval_trigger ON FullTimeSchedules CASCADE;
CREATE TRIGGER full_time_riders_participation_in_hour_interval_trigger
  AFTER UPDATE OF shiftID, rangeID, month OR INSERT OR DELETE 
  ON FullTimeSchedules
    FOR EACH STATEMENT
    EXECUTE FUNCTION check_at_least_five_riders_in_hour_interval(); 

DROP TRIGGER IF EXISTS part_time_riders_participation_in_hour_interval_trigger ON PartTimeSchedules CASCADE;
CREATE TRIGGER part_time_riders_participation_in_hour_interval_trigger
  AFTER UPDATE OF startTime, endTime, day OR INSERT OR DELETE 
  ON PartTimeSchedules
    FOR EACH STATEMENT
    EXECUTE FUNCTION check_at_least_five_riders_in_hour_interval(); 

CREATE OR REPLACE FUNCTION check_part_time_riders_constraints_start_and_end_on_hour() RETURNS TRIGGER 
  AS $$
DECLARE 
  numberRiders INTEGER;
  violatedDay INTEGER;
  violatedStartTime TIME;
  violatedEndTime TIME;
  w INTEGER;
  weeks INTEGER ARRAY;
  rid INTEGER;
  riderIDs INTEGER ARRAY;
BEGIN
  SELECT ARRAY(SELECT DISTINCT week FROM PartTimeSchedules) INTO weeks;
  SELECT ARRAY(SELECT riderID FROM Riders) INTO riderIDs;
  FOREACH rid in ARRAY riderIDs LOOP
    FOREACH w in ARRAY weeks LOOP
      FOR d in 1..7 LOOP
        /*
        Checks if each interval starts and ends on the hour.
        */
        SELECT P.day, P.startTime, P.endTime INTO violatedDay, violatedStartTime, violatedEndTime
        FROM PartTimeSchedules P
        WHERE P.riderID = rid
        AND P.week = w
        AND P.day = d 
        AND (
            (EXTRACT(MINUTE FROM P.startTime) > 0)
            OR (EXTRACT(SECOND FROM P.startTime) > 0)
            OR (EXTRACT(MINUTE FROM P.endTime) > 0)
            OR (EXTRACT(SECOND FROM P.endTime) > 0)
        );

        IF (violatedDay IS NOT NULL) THEN 
          RAISE exception 'Rider % interval at Week % Day % at (% - %)', rid, w, d, violatedStartTime, violatedEndTime;
        END IF;  
      END LOOP;
    END LOOP;
  END LOOP;
  RETURN NULL;
END;
$$ language plpgsql;

CREATE OR REPLACE FUNCTION check_part_time_riders_constraints_between_10_and_48_hours() RETURNS TRIGGER 
  AS $$
DECLARE 
  numberRiders INTEGER;
  numberHoursInRiderWWS INTEGER;
  w INTEGER; 
  weeks INTEGER ARRAY;
  rid INTEGER;
  riderIDs INTEGER ARRAY;
BEGIN
  SELECT ARRAY(SELECT DISTINCT week FROM PartTimeSchedules) INTO weeks;
  SELECT ARRAY(SELECT riderID FROM Riders) INTO riderIDs;
  FOREACH w in ARRAY weeks LOOP
    FOREACH rid in ARRAY riderIDs LOOP
      /*
      Checks total number of hours in all WWS are at least 10 and at most 48 
      */
      SELECT SUM(EXTRACT(HOUR FROM endTime) - EXTRACT(HOUR FROM startTime)) INTO numberHoursInRiderWWS
      FROM PartTimeSchedules P
      WHERE P.riderID = rid
      AND P.week = w;

      IF (numberHoursInRiderWWS < 10) THEN 
        RAISE exception 'Rider % needs to work at least 10 hours in WWS', rid;
      ELSIF (numberHoursInRiderWWS > 48) THEN 
        RAISE exception 'Rider % needs to work at most 48 hours in WWS', rid;
      END IF;  
    END LOOP;
  END LOOP;
  RETURN NULL;
END;
$$ language plpgsql;

CREATE OR REPLACE FUNCTION check_part_time_riders_constraints_1_hour_break() RETURNS TRIGGER 
  AS $$
DECLARE 
  numberRiders INTEGER;
  violatedDay INTEGER;
  violatedStartTime TIME;
  violatedEndTime TIME;
  w INTEGER;
  weeks INTEGER ARRAY;
  rid INTEGER;
  riderIDs INTEGER ARRAY;
BEGIN
  SELECT ARRAY(SELECT DISTINCT week FROM PartTimeSchedules) INTO weeks;
  SELECT ARRAY(SELECT riderID FROM Riders) INTO riderIDs;
  FOREACH rid in ARRAY riderIDs LOOP
    FOREACH w in ARRAY weeks LOOP
      FOR d in 1..7 LOOP
        /*
        Checks if at least one hour of break between two consecutive hour intervals.
        */
        SELECT P.day, P.startTime, P.endTime INTO violatedDay, violatedStartTime, violatedEndTime
        FROM PartTimeSchedules P 
        WHERE P.riderID = rid
        AND P.week = w 
        AND P.day = d
        AND EXISTS (SELECT 1
                    FROM PartTimeSchedules P2
                    WHERE P2.riderID = P.riderID
                    AND P2.week= P.week
                    AND P2.day = P.day
                    AND (EXTRACT(HOUR FROM P.startTime) - EXTRACT(HOUR FROM P2.endTime) = 0) -- Indicates startTime = endTime in two different intervals 
                    ); 
        
        IF (violatedDay IS NOT NULL) THEN 
          RAISE exception 'Rider % WWS at Week % Day % for interval % - % is not valid. 
          Must have at least one hour of break between two consecutive hour intervals.', rid, w, violatedDay, violatedStartTime, violatedEndTime;
        END IF;
      END LOOP;
    END LOOP; 
  END LOOP;
  RETURN NULL;
END;
$$ language plpgsql;

CREATE OR REPLACE FUNCTION check_part_time_riders_constraints_max_interval_4_hours() RETURNS TRIGGER 
  AS $$
DECLARE 
  numberRiders INTEGER;
  violatedDay INTEGER;
  violatedStartTime TIME;
  violatedEndTime TIME;
  w INTEGER;
  weeks INTEGER ARRAY;
  rid INTEGER;
  riderIDs INTEGER ARRAY;
BEGIN
  SELECT ARRAY(SELECT DISTINCT week FROM PartTimeSchedules) INTO weeks;
  SELECT ARRAY(SELECT riderID FROM Riders) INTO riderIDs;
  FOREACH rid in ARRAY riderIDs LOOP
    FOREACH w in ARRAY weeks LOOP
      FOR d in 1..7 LOOP
        /*
        Checks that each interval does not exceed four hours.
        */
        SELECT P.day, P.startTime, P.endTime INTO violatedDay, violatedStartTime, violatedEndTime
        FROM PartTimeSchedules P
        WHERE P.riderID = rid
        AND P.week = w
        AND P.day = d 
        AND EXTRACT(HOUR FROM P.endTime) - EXTRACT(HOUR FROM P.startTime) > 4;

        IF (violatedDay IS NOT NULL) THEN 
          RAISE exception 'Rider % WWS at Week % Day % for interval % - % cannot be exceed four hours.',
                          rid, w, violatedDay, violatedStartTime, violatedEndTime;
        END IF;
      END LOOP;
    END LOOP; 
  END LOOP;
  RETURN NULL;
END;
$$ language plpgsql;

CREATE OR REPLACE FUNCTION check_part_time_riders_constraints_valid_intervals() RETURNS TRIGGER 
  AS $$
DECLARE 
  numberRiders INTEGER;
  violatedDay INTEGER;
  violatedStartTime TIME;
  violatedEndTime TIME;
  w INTEGER;
  weeks INTEGER ARRAY;
  rid INTEGER;
  riderIDs INTEGER ARRAY;
BEGIN
  SELECT ARRAY(SELECT DISTINCT week FROM PartTimeSchedules) INTO weeks;
  SELECT ARRAY(SELECT riderID FROM Riders) INTO riderIDs;
  FOREACH rid in ARRAY riderIDs LOOP
    FOREACH w in ARRAY weeks LOOP
      FOR d in 1..7 LOOP
        /*
        Checks that no intervals overlap in a rider's WWS or exist between 1000-2200. 
        */
        SELECT P.day, P.startTime, P.endTime INTO violatedDay, violatedStartTime, violatedEndTime
        FROM PartTimeSchedules P 
        WHERE P.riderID = rid
        AND P.week = w
        AND P.day = d
        AND EXISTS (SELECT 1
                    FROM PartTimeSchedules P2
                    WHERE P2.riderID = P.riderID
                    AND P2.week = P.week
                    AND P2.day = P.day
                    AND ((P.startTime, P.endTime) <> (P2.startTime, P2.endTime)) -- differentiate common intervals 
                    AND ((P.startTime, P.endTime) OVERLAPS (P2.startTime, P2.endTime)) 
                    )
        OR (NOT (P.startTime, P.endTime) OVERLAPS ('10:00:00'::TIME, '22:00:00'::TIME));

        IF (violatedDay IS NOT NULL) THEN 
          RAISE exception 'Rider % WWS at Week % Day % for interval % - % cannot overlap with another existing interval in the WWS and must exist between 1000-2200',
                          rid, w, violatedDay, violatedStartTime, violatedEndTime;
        END IF;
      END LOOP; 
    END LOOP;
  END LOOP;
  RETURN NULL;
END;
$$ language plpgsql;

-- After ROW-level triggers take some time due to the number of checks done per insertion.
DROP TRIGGER IF EXISTS part_time_riders_schedule_start_and_end_on_hour_trigger ON PartTimeSchedules CASCADE;
CREATE CONSTRAINT TRIGGER part_time_riders_schedule_start_and_end_on_hour_trigger
  AFTER UPDATE OF riderID, startTime, endTime OR INSERT 
  ON PartTimeSchedules
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION check_part_time_riders_constraints_start_and_end_on_hour();

DROP TRIGGER IF EXISTS part_time_riders_schedule_between_10_and_48_hours_trigger ON PartTimeSchedules CASCADE;
CREATE CONSTRAINT TRIGGER part_time_riders_schedule_between_10_and_48_hours_trigger
  AFTER UPDATE OF riderID, startTime, endTime OR INSERT OR DELETE 
  ON PartTimeSchedules
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION check_part_time_riders_constraints_between_10_and_48_hours();

DROP TRIGGER IF EXISTS part_time_riders_schedule_1_hour_break_trigger ON PartTimeSchedules CASCADE;
CREATE TRIGGER part_time_riders_schedule_1_hour_break_trigger
  AFTER UPDATE OF riderID, startTime, endTime OR INSERT  
  ON PartTimeSchedules
    FOR EACH STATEMENT
    EXECUTE FUNCTION check_part_time_riders_constraints_1_hour_break();

DROP TRIGGER IF EXISTS part_time_riders_schedule_max_interval_4_hours_trigger ON PartTimeSchedules CASCADE;
CREATE TRIGGER part_time_riders_schedule_max_interval_4_hours_trigger
  AFTER UPDATE OF riderID, startTime, endTime, week OR INSERT 
  ON PartTimeSchedules
    FOR EACH STATEMENT
    EXECUTE FUNCTION check_part_time_riders_constraints_max_interval_4_hours();

DROP TRIGGER IF EXISTS part_time_riders_schedule_valid_intervals_trigger ON PartTimeSchedules CASCADE;
CREATE TRIGGER part_time_riders_schedule_valid_intervals_trigger
  AFTER UPDATE OF riderID, startTime, endTime, week OR INSERT  
  ON PartTimeSchedules
    FOR EACH STATEMENT
    EXECUTE FUNCTION check_part_time_riders_constraints_valid_intervals();

CREATE OR REPLACE FUNCTION check_part_time_rider_valid_rider() RETURNS TRIGGER 
	AS $$ 
DECLARE 
  valid_rider INTEGER;
BEGIN
	SELECT riderID INTO valid_rider
		FROM Riders 
		WHERE riderID = NEW.riderID 
    AND isFullTime = FALSE;

	IF valid_rider IS NULL THEN 
		RAISE exception 'Rider % is not a part-time rider ', NEW.riderID;
	END IF;  
  RETURN NULL;
END; 
$$ language plpgsql;

DROP TRIGGER IF EXISTS part_time_riders_schedule_valid_rider_trigger ON PartTimeSchedules CASCADE;
CREATE TRIGGER part_time_riders_schedule_valid_rider_trigger
  AFTER UPDATE OF riderID OR INSERT  
  ON PartTimeSchedules
    FOR EACH ROW
    EXECUTE FUNCTION check_part_time_rider_valid_rider();

CREATE OR REPLACE FUNCTION check_full_time_rider_valid_rider() RETURNS TRIGGER 
	AS $$ 
DECLARE 
  valid_rider INTEGER;
BEGIN
	SELECT riderID INTO valid_rider
		FROM Riders 
		WHERE riderID = NEW.riderID 
    AND isFullTime = TRUE;

	IF valid_rider IS NULL THEN 
		RAISE exception 'Rider % is not a full-time rider ', NEW.riderID;
	END IF;  
  RETURN NULL;
END; 
$$ language plpgsql;

DROP TRIGGER IF EXISTS full_time_riders_schedule_valid_rider_trigger ON FullTimeSchedules CASCADE;
CREATE TRIGGER full_time_riders_schedule_valid_rider_trigger
  AFTER UPDATE OF riderID OR INSERT  
  ON FullTimeSchedules
    FOR EACH ROW
    EXECUTE FUNCTION check_full_time_rider_valid_rider();

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
\copy Restaurants(restaurantID, restaurantName, minOrderCost, contactNum, address, postalCode, image) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Restaurants.csv' DELIMITER ',' CSV HEADER;
\copy FoodItems(foodItemID, foodItemName, price, availabilityStatus, image, maxNumOfOrders, category, restaurantID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/FoodItems.csv' DELIMITER ',' CSV HEADER;
\copy RestaurantStaff(restaurantStaffID, restaurantStaffName, contactNum, restaurantID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/RestaurantStaff.csv' DELIMITER ',' CSV HEADER;
\copy Manages(restaurantStaffID, foodItemID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Manages.csv' DELIMITER ',' CSV HEADER;
\copy Promotions(promotionID, startTimeStamp, endTimeStamp) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Promotions.csv' DELIMITER ',' CSV HEADER;
\copy Offers(restaurantID, promotionID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Offers.csv' DELIMITER ',' CSV HEADER;
\copy TargettedPromoCode(promotionID, promotionDetails) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/TargettedPromoCode.csv' DELIMITER ',' CSV HEADER;
\copy Percentage(promotionID, percentageAmount) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Percentage.csv' DELIMITER ',' CSV HEADER;
\copy Amount(promotionID, absoluteAmount) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Amount.csv' DELIMITER ',' CSV HEADER;;
\copy FreeDelivery(promotionID, deliveryAmount) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/FreeDelivery.csv' DELIMITER ',' CSV HEADER;
\copy FDSManagers(managerID, managerName, contactNum) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/FDSManagers.csv' DELIMITER ',' CSV HEADER;
\copy Launches(managerID, promotionID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Launches.csv' DELIMITER ',' CSV HEADER;
\copy DeliveryFee(deliveryID, deliveryFeeAmount) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/DeliveryFee.csv' DELIMITER ',' CSV HEADER;
\copy Customers(customerID, customerName, customerEmail, customerPassword, customerPhone, rewardPoints, dateCreated) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Customers.csv' DELIMITER ',' CSV HEADER;
\copy Sets(managerID, deliveryID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Sets.csv' DELIMITER ',' CSV HEADER;
\copy Riders(riderID,riderName,riderEmail,contactNum,isOccupied,isFullTime,baseSalary) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Riders.csv' DELIMITER ',' CSV HEADER;
\copy Orders(orderID, status, orderPlacedTimeStamp, riderDepartForResTimeStamp, riderArriveAtResTimeStamp, riderCollectOrderTimeStamp, riderDeliverOrderTimeStamp, specialRequest, deliveryAddress, riderID, deliveryID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Orders.csv' DELIMITER ',' CSV HEADER;
\copy Applies(orderID, promotionID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Applies.csv' DELIMITER ',' CSV HEADER;
\copy Contains(quantity, foodItemID, orderID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Contains.csv' DELIMITER ',' CSV HEADER;
\copy CreditCards(customerID, creditCardNumber, creditCardName, expiryMonth, expiryYear) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/CreditCards.csv' DELIMITER ',' CSV HEADER;
\copy Payments(paymentID, orderID, creditCardNumber, useCash, useCreditCard, useRewardPoints) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Payments.csv' DELIMITER ',' CSV HEADER; 
\copy Requests(orderID, paymentID, customerID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Requests.csv' DELIMITER ',' CSV HEADER;
\copy Addresses(addressID,address, addressTimeStamp, postalCode, customerID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Addresses.csv' DELIMITER ',' CSV HEADER;
\copy Rates(customerID, riderID, orderID, rating) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Rates.csv' DELIMITER ',' CSV HEADER;
\copy Shifts(shiftID, shiftOneStart, shiftOneEnd, shiftTwoStart, shiftTwoEnd) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Shifts.csv' DELIMITER ',' CSV HEADER;
\copy PartTimeSchedules(riderID, startTime, endTime, week, day) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/PartTimeSchedules.csv' DELIMITER ',' CSV HEADER;
-- Needs several tables to be createdgigggg before it
\copy Reviews(reviewID, reviewImg, reviewMsg, customerID, foodItemID) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/Reviews.csv' DELIMITER ',' CSV HEADER;

-- Insert DayRanges values
INSERT INTO DayRanges VALUES (1,'{1,2,3,4,5}');
INSERT INTO DayRanges VALUES (2,'{2,3,4,5,6}');
INSERT INTO DayRanges VALUES (3,'{3,4,5,6,7}');
INSERT INTO DayRanges VALUES (4,'{4,5,6,7,1}');
INSERT INTO DayRanges VALUES (5,'{5,6,7,1,2}');
INSERT INTO DayRanges VALUES (6,'{6,7,1,2,3}');
INSERT INTO DayRanges VALUES (7,'{7,1,2,3,4}');

-- Needs to be after DayRanges
\copy FullTimeSchedules(riderID, shiftID, rangeID, month) from '/Users/User/Downloads/lingzhiyu/CS2102Backend/database/mock_data/FullTimeSchedules.csv' DELIMITER ',' CSV HEADER;

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

-- When user create an account, the system will auto add address with customer acc
CREATE OR REPLACE FUNCTION add_customer_and_address(customerName text, customerEmail text, customerPassword text, customerPhone text, rewardPoints integer, dateCreated date, address text, postalCode integer)
RETURNS VOID AS $$
DECLARE 
    customerId INTEGER;
BEGIN
    INSERT INTO Customers(customerName, customerEmail,customerPassword,customerPhone,rewardPoints,dateCreated) VALUES ($1, $2, $3, $4, $5, $6);
    SELECT C.customerID into customerId
    FROM Customers C
    WHERE C.customerEmail = $2;
    INSERT INTO Addresses(address, addressTimeStamp ,postalCode, customerID) VALUES($7, $6, $8,customerId);
END;
$$ language plpgsql;

-- Each order must exceed minimum order cost of restaurant
CREATE OR REPLACE FUNCTION order_more_than_min_amount() RETURNS TRIGGER
    AS $$
DECLARE
    orderTotalCost NUMERIC(6, 2);
    minOrderCost NUMERIC(6, 2);
BEGIN
  SELECT OC.totalCostOfOrder INTO orderTotalCost
  FROM OrderCosts OC
  WHERE OC.orderID = NEW.orderID;

  SELECT R.minOrderCost INTO minOrderCost
  FROM Contains C 
    JOIN FoodItems FI using (foodItemID)
    JOIN Restaurants R using (restaurantID)
  WHERE C.orderID = NEW.orderID;

  IF orderTotalCost < minOrderCost THEN
    RAISE EXCEPTION 'Order total cost of % does not meet restaurant minimum order cost of %', 
      orderTotalCost, minOrderCost;
  END IF;
  RETURN NEW;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_new_orders_min_amt_trigger ON Orders CASCADE;
CREATE CONSTRAINT TRIGGER after_new_orders_min_amt_trigger 
  AFTER INSERT ON Orders
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW 
    EXECUTE FUNCTION order_more_than_min_amount();
