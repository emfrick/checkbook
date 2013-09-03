///////////////////////
// Module Dependencies
///////////////////////
var express = require('express');
var http    = require('http');
var app = new express();
var server = http.createServer(app);
var db = require('./database');
var config = require('./config');

///////////
// Globals
///////////
var application_root = __dirname;
var host = config.app.address;
var port = config.app.port;

/////////////
// App Setup
/////////////
app.configure(function() {
    app.use(express.bodyParser());      // parses request body and populates req.body
    app.use(express.methodOverride());  // check req.body for HTTP method overrides
    app.use(app.router);                // perform lookup based on url and HTTP method
    app.use(express.static(application_root + '/public'));  // where to get the static files
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));  // show all errors in development
});

// Start the server and connect to the database
server.listen(port, host, function() {
    console.log("ExpressJS server started on @[%s], port [%d], in [%s] mode.", host, port, app.settings.env);
    db.conn.connect();
});

////////////////////
// Setup the routes
////////////////////
app.all('*', function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Content-Type", "application/json");
    res.header("Access-Control-Allow-Methods", "POST, GET, PUT, DELETE, OPTIONS");
    next();
});

app.get("/api", function(req, res) {
    return res.send("API is running...");
});

app.get("/api/transactions", function(req, res) {
    var date  = new Date();
    var year  = date.getFullYear();
    var month = date.getMonth() + 1;
    console.log("  Getting transactions for this month: " + month);

    db.getByMonth(year, month, function(results) {
        return res.send(results);
    });
});

app.get("/api/transactions/all", function(req, res) {
    console.log("  Getting ALL transactions");

    db.getAll(function(results) {
        return res.send(results);
    });
});

app.get("/api/transactions/:year([0-9]+)", function(req, res) {
    var year  = req.params.year;
    console.log("  Getting transactions for " + year + ".");

    db.getByYear(year, function(results) {
        return res.send(results);
    });
});

app.get("/api/transactions/:year([0-9]+)/:month([0-9]+)", function(req, res) {
    var year = req.params.year;
    var month = req.params.month;
    console.log("  Getting transactions for " + month + "/" + year);

    db.getByMonth(year, month, function(results) {
        return res.send(results);
    });
});

app.get("/api/transactions/:year([0-9]+)/:month([0-9]+)/:day([0-9]+)", function(req, res) {
    var year  = req.params.year;
    var month = req.params.month;
    var day   = req.params.day;
    console.log("  Getting transactions for " + month + "/" + day + "/" + year + ".");

    db.getByDay(year, month, day, function(results) {
        return res.send(results);
    });
});

app.get("/api/transactions/id/:id([0-9]+)", function(req, res) {
    var id = req.params.id;
    console.log("  Getting by ID: " + id);

    db.getById(id, function(results) {
        return res.send(results[0]);
    });
});

app.post("/api/transactions/id", function(req, res) {
    console.log("  Inserting a transaction");
    var transaction, date, description, category, amount = undefined;

    transaction = req.body;
    date        = transaction.date;
      year      = date.substring(0,4);
      month     = date.substring(5,7);
      day       = date.substring(8,10);
    description = transaction.description.replace("'","\\'");
    category    = (!transaction.category) ? "" : transaction.category;
    amount      = transaction.amount;

    console.log("    DATE:        " + date);
    console.log("      year:      " + year);
    console.log("      month:     " + month);
    console.log("      day:       " + day);
    console.log("    DESCRIPTION: " + description);
    console.log("    CATEGORY:    " + category);
    console.log("    AMOUNT:      " + amount);

    db.insert(year, month, day, description, category, amount, function(resultId) {
        db.getById(resultId, function(results) {
            return res.send(results);
        });
    });
});

app.put("/api/transactions/id/:id", function(req, res) {
    console.log("  Updating a transaction");
    var transaction, date, description, category, amount, id = undefined;

    id          = req.params.id;
    transaction = req.body;
    date        = transaction.date;
      year      = date.substring(0,4);
      month     = date.substring(5,7);
      day       = date.substring(8,10);
    description = transaction.description.replace("'","\\'");
    category    = (!transaction.category) ? "" : transaction.category;
    amount      = transaction.amount;

    console.log("    ID:          " + id);
    console.log("    DATE:        " + date);
    console.log("      year:      " + year);
    console.log("      month:     " + month);
    console.log("      day:       " + day);
    console.log("    DESCRIPTION: " + description);
    console.log("    CATEGORY:    " + category);
    console.log("    AMOUNT:      " + amount);

    db.update(id, year, month, day, description, category, amount, function(resultId) {
        db.getById(resultId, function(results) {
            return res.send(results);
        });
    });
});

app.delete("/api/transactions/id/:id", function(req, res) {
    console.log("  Deleting a transaction");
    var id = undefined;

    id = req.params.id;

    console.log("    ID: " + id);

    db.delete(id, function(results) {
        return res.send(results);
    });
});
