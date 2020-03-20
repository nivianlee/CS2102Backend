const express = require("express");
const bodyParser = require("body-parser");
const db = require("./queries");
const cusDb = require("./api_customer_portal/customers");
const fdsManagers = require("./admin/fdsManagers");

const app = express();
const port = 3000;

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
  next();
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.get("/", (request, response) => {
  response.json({ info: "Node.js, Express, and Postgres API" });
});

app.get("/users", db.getUsers);

//customer apis
app.get("/customers", cusDb.getCustomers);
app.get("/customers/:id", cusDb.getCustomerById);
app.post("/customers", cusDb.createCustomer);
app.put("/customers/:id", cusDb.updateCustomer);
app.delete("/customers/:id", cusDb.deleteCustomer);

// admin: fdsManagers
app.get("/fdsManagers", fdsManagers.getFDSManagers);
app.get("/fdsManagers/:managerid", fdsManagers.getFDSManagersById);
app.post("/fdsManagers", fdsManagers.createFDSManagers);
app.post("/fdsManagers/:managerid", fdsManagers.updateFDSManagers);
app.delete("/fdsManagers/:managerid", fdsManagers.deleteFDSManagers);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
