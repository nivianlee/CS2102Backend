/* Tests for after_new_orders_trigger */
-- Negative Test Case: Will raise exception since foodItem 21's maxNum is 1
BEGIN;
    INSERT INTO Orders(orderID, status, orderPlacedTimeStamp, riderDepartForResTimeStamp, riderArriveAtResTimeStamp, riderCollectOrderTimeStamp, riderDeliverOrderTimeStamp, specialRequest, deliveryAddress, riderID, deliveryID)
    VALUES (301, FALSE, '5/4/2020 10:00', '5/8/2019 8:06', '5/8/2019 8:06', '5/8/2019 8:15', '5/8/2019 8:21', null, '864 Merchant Hill', 100, 3);

    INSERT INTO Contains(quantity, foodItemID, orderID)
    VALUES(3, 21, 301);
COMMIT;

-- Positive Test Case: Sets availabilityStatus for foodItem 21 to false.
BEGIN;
    INSERT INTO Orders(orderID, status, orderPlacedTimeStamp, riderDepartForResTimeStamp, riderArriveAtResTimeStamp, riderCollectOrderTimeStamp, riderDeliverOrderTimeStamp, specialRequest, deliveryAddress, riderID, deliveryID)
    VALUES (301, FALSE, '5/4/2020 11:00', '5/8/2019 8:06', '5/8/2019 8:06', '5/8/2019 8:15', '5/8/2019 8:21', null, '864 Merchant Hill', 100, 3);

    INSERT INTO Contains(quantity, foodItemID, orderID)
    VALUES(2, 21, 301);
COMMIT;

/* Tests for before_new_orders_trigger */
-- Positive Test Case
BEGIN;
    INSERT INTO Orders(orderID, status, orderPlacedTimeStamp, riderDepartForResTimeStamp, riderArriveAtResTimeStamp, riderCollectOrderTimeStamp, riderDeliverOrderTimeStamp, specialRequest, deliveryAddress, riderID, deliveryID)
    VALUES (302, FALSE, '6/4/2020 10:00', '5/8/2019 8:06', '5/8/2019 8:06', '5/8/2019 8:15', '5/8/2019 8:21', null, '864 Merchant Hill', 100, 3);

    INSERT INTO Contains(quantity, foodItemID, orderID)
    VALUES(1, 21, 302);
COMMIT;

/* Tests for part_time_riders_schedule_max_interval_4_hours_trigger */
-- Positive Test Case: Add interval that lies within 1000-2200, max 4 hours
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (200, '10:00:00', '14:00:00', 4, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

-- Negative Test Case: Add interval that lies within 1000-2200, more than 4 hours 
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (1, '10:00:00', '15:00:00', 1, 1);

    -- Will only run when negative case passes 
    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

/* Tests for part_time_riders_schedule_valid_intervals_trigger*/
-- Positive Test Case: Add interval that is in 1000-2200
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (200, '10:00:00', '14:00:00', 4, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

-- Negative Test Case: Add interval that lies out of 1000-2200
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (200, '9:00:00', '10:00:00', 4, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

/* Tests for part_time_riders_schedule_1_hour_break */
-- Positive Test Case: Add interval that satisfies 1 hour break between consecutive intervals 
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (200, '10:00:00', '11:00:00', 4, 1);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (200, '12:00:00', '13:00:00', 4, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

-- Negative Test Case: Add interval that violates 1 hour break between consecutive intervals
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (200, '10:00:00', '11:00:00', 4, 1);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (200, '11:00:00', '12:00:00', 4, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

/* Tests for part_time_riders_schedule_between_10_and_48_hours_trigger*/
-- Positive Test Case: Add interval that satisfies this constraint

-- Negative Test Case: Add a lone rider with only 1 schedule entry in a statement 
-- RiderID must be Riders.size + 1 to detect error
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (101, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (101, '10:00:00', '11:00:00', 4, 1);
COMMIT;

-- Negative Test Case: Remove interval(s) that breaks this constraint 
-- Remove all entries; must implement check on delete
BEGIN;
    DELETE FROM PartTimeSchedules P 
    WHERE P.riderID = 1 AND P.day <> 1;
COMMIT;

/* Tests for part_time_riders_schedule_start_and_end_on_hour_trigger */
-- Positive Test Case: Add interval that starts and ends on the hour 
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (200, '10:00:00', '11:00:00', 4, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

-- Negative Test Case: Add interval that does not start and end on the hour
-- RiderID must be Riders.size + 1 to detect error
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (101, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, duration, day)
    VALUES (101, '10:00:00', '11:30:00', 4, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 101;
COMMIT;

/* Tests for part_time_riders_participation_in_hour_interval_trigger and full_time_riders_participation_in_hour_interval_trigger*/
-- Positive Test Case: Add interval for part time rider such that each hour interval still has 5 riders
-- Won't throw exception if recordss already have 5 riders 

-- Negative Test Case: Remove interval for both part time and full time riders that results in hour interval having less than 5 riders 
BEGIN;
    DELETE FROM PartTimeSchedules P 
    WHERE P.startTime = '10:00:00'::TIME;

    DELETE FROM FullTimeSchedules F 
    WHERE F.startTime = '10:00:00'::TIME;
COMMIT;
