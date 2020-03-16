CSV files need to be in the same directory as init.sql
Otherwise, specify the path to the .csv files
Column Names in the CSV files must all match the column names listed in init.sql

Note: 
1. DELIMITER is used to specify the delimiter we are using. Since it is CSV, ',' is used.
2. CSV is used to specify that we are copying from a csv file.
3. HEADER is used to specify that we are ignoring the first row when copying
4. \copy Promotions copies the entries in the Promotions sheet in Promotions.csv