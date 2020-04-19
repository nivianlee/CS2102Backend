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

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (200, '10:00:00', '14:00:00', 16, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

-- Negative Test Case: Add interval that lies within 1000-2200, more than 4 hours 
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (200, '10:00:00', '15:00:00', 16, 1);

    -- Will only run when negative case passes 
    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

/* Tests for part_time_riders_schedule_valid_intervals_trigger*/
-- Positive Test Case: Add interval that is in 1000-2200
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (200, '10:00:00', '14:00:00', 16, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

-- Negative Test Case: Add interval that lies out of 1000-2200
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (200, '9:00:00', '10:00:00', 16, 1);
COMMIT;

/* Tests for part_time_riders_schedule_1_hour_break */
-- Positive Test Case: Add interval that satisfies 1 hour break between consecutive intervals 
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (200, '10:00:00', '11:00:00', 16, 1);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (200, '12:00:00', '13:00:00', 16, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

-- Negative Test Case: Add interval that violates 1 hour break between consecutive intervals
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (200, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (200, '10:00:00', '11:00:00', 16, 1);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (200, '11:00:00', '12:00:00', 16, 1);

    DELETE FROM Riders R
    WHERE R.riderID = 200;
COMMIT;

/* Tests for part_time_riders_schedule_between_10_and_48_hours_trigger*/
-- Positive Test Case: Add interval that satisfies this constraint
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (101, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 1);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 1);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 2);

    DELETE FROM Riders R
    WHERE R.riderID = 101;
COMMIT;

-- Negative Test Case: Add a lone rider with only 1 schedule entry in a statement 
BEGIN;
    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (101, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '11:00:00', 16, 1);
COMMIT;

-- Negative Test Case: Add a lone rider with  schedule entries > 48 hours 
BEGIN;
    SET CONSTRAINTS part_time_riders_schedule_between_10_and_48_hours_trigger DEFERRED;

    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (101, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 1);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 1);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 2);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 2);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 3);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 3); 
    
    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 4);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 4);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 5);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 5); 
    
    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 6);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 6);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 7);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 7); 
COMMIT;


-- -- Negative Test Case: Remove interval(s) that breaks this constraint 
-- Remove all entries; must implement check on delete
BEGIN;
    DELETE FROM PartTimeSchedules P 
    WHERE P.riderID = 1 AND P.day <> 1;
COMMIT;

/* Tests for part_time_riders_schedule_start_and_end_on_hour_trigger */
-- Positive Test Case: Add interval that starts and ends on the hour 
BEGIN;
    SET CONSTRAINTS part_time_riders_schedule_start_and_end_on_hour_trigger DEFERRED;

    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (101, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    -- For a valid interval schedule > 10 hours 
    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 1); -- overlapped by insertion below 
    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 1);
    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 2);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 2); -- overlaps

    DELETE FROM Riders R
    WHERE R.riderID = 101;
COMMIT;

-- Negative Test Case: Add interval that does not start and end on the hour
BEGIN;
    SET CONSTRAINTS part_time_riders_schedule_start_and_end_on_hour_trigger DEFERRED;

    INSERT INTO Riders(riderID, riderName, riderEmail, contactNum, isOccupied, isFullTime, baseSalary)
    VALUES (101, 'Dummy', 'dummy@dummymail.com', '12345678', TRUE, TRUE, 123);

    -- For a valid interval schedule > 10 hours 
    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 1); -- overlapped by insertion below 
    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '15:00:00', '19:00:00', 16, 1);
    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '14:00:00', 16, 2);

    INSERT INTO PartTimeSchedules(riderID, startTime, endTime, week, day)
    VALUES (101, '10:00:00', '11:00:00', 16, 1); -- overlaps

    DELETE FROM Riders R
    WHERE R.riderID = 101;
COMMIT;

/* Tests for part_time_riders_participation_in_hour_interval_trigger and full_time_riders_participation_in_hour_interval_trigger*/
-- Positive Test Case: Add interval for part time rider such that each hour interval still has 5 riders
-- Won't throw exception if records already have 5 riders per hour interval 

-- Negative Test Case: Remove interval for both part time and full time riders that results in hour interval having less than 5 riders 
BEGIN;
    DELETE FROM PartTimeSchedules P 
    WHERE P.startTime = '10:00:00'::TIME; -- delete all schedules at '10:00:00'
COMMIT;

BEGIN;
    DELETE FROM FullTimeSchedules F -- delete all from shift
    WHERE shiftID <> 1;
COMMIT;
