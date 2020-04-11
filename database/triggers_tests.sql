/* Tests for reviews_trigger */
-- Positive Test Case
INSERT INTO Reviews(reviewImg, reviewMsg, customerID, foodItemID)
VALUES('Image', 'Message', 15, 1);

-- Negative Test Case: Will raise exception since Customer 1 did not order foodItem 2
INSERT INTO Reviews(reviewImg, reviewMsg, customerID, foodItemID)
VALUES('Image', 'Message', 1, 2);

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