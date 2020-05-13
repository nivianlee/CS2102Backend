# CS2102 Team 7: KinKao

![KinKao](https://user-images.githubusercontent.com/34975891/81268091-128f1c00-907a-11ea-821d-95c6ec73b1d5.png)

Today's #1 food delivery service app!

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

There are 2 systems - **CS2102Backend** and **CS2102Frontend**.

## CS2102Backend

### Prerequisites

What things you need to install the software and how to install them

```
12.1 // PostgreSQL version
12.15 // Node version
```

### Installing

A step by step series of examples that tell you how to get a development env running.

#### PostgreSQL

Head to this link for the installation process of PostgreSQL server on your local machine. https://www.postgresqltutorial.com/install-postgresql/

#### Microsoft Visual Studios Code

A preferred source-code editor is VS Code. Head to this link for the installation process of Microsoft Visual Studios Code on your local machine. https://code.visualstudio.com/docs/setup/setup-overview

#### Create database

Once a PostgreSQL server has been set up, open psql shell to log into the server. Run the following command in psql shell to change the directory based on where the **CS2102Backend** folder is located.

```
\cd <YOUR_DIRECTORY>/CS2102Backend/database
```

To check if your current directory is correct, run the following command.

```
\! pwd
```

Run the following commands to create a database named cs2102.

```
create database cs2102;
```

After database is created, connect to cs2102 database.

```
\c cs2102
```

#### Change path in init.sql

Open init.sql using VS Code. Press control+f or command+f to find `<YOUR_DIRECTORY>` and after selecting 1 of the `<YOUR_DIRECTORY>`, use control+d or command+d and keep pressing until you are brought back to the initially selected `<YOUR_DIRECTORY>`. Replace `<YOUR_DIRECTORY>` with the directory shown from running the `\! pwd` command earlier.

#### Initialise init.sql

If you are running on a macOS or Linux machine, please run the following command first before initialising init.sql. This is necessary as the `datetime` used by PostgreSQL differs from a Windows OS and a macOS or Linux. More info can be obtained here: https://stackoverflow.com/questions/29374472/error-date-time-field-value-out-of-range-30-12-2014-235804-postgresql

```
SET datestyle = dmy;
```

To obtain the list of tables and mock data used in the project, initialise init.sql by the following command.

```
\i init.sql
```

#### Test

Run the following command to display the database tables in the database. Afterwards, you can run a few `SELECT` queries to check if mock data has been populated into the database.

```
\dt
```

```
SELECT * from customers;
```

#### Run database

Open command prompt or terminal and change the directory to the directory with **CS2102Backend** folder. Run the following command.

```
npm install
```

```
npm start
```

If the command prompt or terminal shows the following message, it means that the database is up and running on port 3000.

```
App running on port 3000
```

And you're all set!

## CS2102Frontend

### Prerequisites

What things you need to install the software and how to install them

```
12.15 // Node version
6.14 // npm version
```

### Installing

A step by step series of examples that tell you how to get a development env running.

#### PostgreSQL

Head to this link for the installation process of npm on your local machine. https://www.npmjs.com/get-npm

#### Install libraries

Open command prompt or terminal and navigate to the directory where **CS2102Frontend** is at. Inside **CS2102Frontend** there are two subfolders, **admin** and **customer**. Go into each of the folder and run the following command.

```
npm install
```

#### Running admin web application

Run the following command to run the **admin** frontend application. You will be prompted that another port is listening to port 3000, which is currently where the database is on. Enter `Y` to allow running on a different port instead.

```
npm start
```

A new web browser window would load the frontend web application. The first page of the frontend web application is as follows.

![admin](https://user-images.githubusercontent.com/34975891/81273545-9993c280-9081-11ea-8935-a6dc12c79d10.png)

Once you're viewing this page, you're good to go!

#### Running customer web application

Run the following command to run the **customer** frontend application. You will be prompted that another port is listening to port 3000, which is currently where the database is on. Enter `Y` to allow running on a different port instead.

```
npm start
```

A new web browser window would load the frontend web application. The first page of the frontend web application is as follows.

![customer](https://user-images.githubusercontent.com/34975891/81297411-c8bc2b00-90a5-11ea-8250-9d3d90d4772a.jpeg)

Once you're viewing this page, you're good to go!

## Built With

- [Node.js](https://nodejs.org/en/)
- [Express.js](https://expressjs.com/)
- [React.js](https://reactjs.org/)
- [Material UI](https://material-ui.com/)

## Authors

[Andy Chan](https://github.com/andlimey)
[Ling Zhi Yu](https://github.com/lingzhiyu)
[Nivian Lee](https://github.com/nivianlee)
[Nittayawan Charoenkharungrueang](https://github.com/cnitta)

## Acknowledgments

- Prof Chan
- TA Jeffrey
