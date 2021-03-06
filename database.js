var mysql = require('mysql');
var config = require('./config');

// Database setup
Setup();
function Setup() {
    if (config.app.environment == "production") {
        exports.conn = mysql.createConnection(process.env.DATABASE_URL);
    }
    else {
        exports.conn = mysql.createConnection({
            hostname   : config.database.hostname,
            user       : config.database.user,
            password   : config.database.password,
            socketPath : config.database.socket,
            database   : config.database.name,
        });
    }
};

// Connection to the MySQL server is usually
// lost due to either server restart, or a
// connnection idle timeout (the wait_timeout
// server variable configures this)
exports.conn.on('error', function(err) {
    console.log('Database Error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { 
        Setup();
    } 
    else {
        throw err;
    }
});

// Get all transactions ever
exports.getAll = function(callback) {
    var strQuery = "SELECT * FROM transactions " +
                   "ORDER BY date, amount";
    console.log(strQuery);

    this.conn.query(strQuery, function(err, rows, fields) {
        if (err) throw err;

        callback(rows);
    });
};

// Get all transactions within a given year
exports.getByYear = function(year, callback) {
    var strQuery = "SELECT * FROM transactions " +
                   "WHERE date " + 
                   "BETWEEN DATE('" + year + "-01-01') " +
                   "AND DATE('" + year + "-12-31') " +
                   "ORDER BY date, amount";
    console.log(strQuery);

    this.conn.query(strQuery, function(err, rows, fields) {
        if (err) throw err;
        
        callback(rows);
    });

};

// Get all transactions within a given month
exports.getByMonth = function(year, month, callback) {
    var lastday = new Date(year, month, 0).getDate();

    var strQuery = "SELECT * FROM transactions " +
                   "WHERE date " +
                   "BETWEEN DATE('" + year + "-" + month + "-01') " +
                   "AND DATE('" + year + "-" + month + "-" + lastday + "') " +
                   "ORDER BY date, amount";
    console.log(strQuery);

    this.conn.query(strQuery, function(err, rows, fields) {
        if (err) throw err;

        callback(rows);
    });
};

// Get all transactions that happened on a certain day
exports.getByDay = function(year, month, day, callback) {
    var strQuery = "SELECT * FROM transactions " +
                   "WHERE date = DATE('" + year + "-" + month + "-" + day + "') " +
                   "ORDER BY amount";
    console.log(strQuery);

    this.conn.query(strQuery, function(err, rows, fields) {
        if (err) throw err;

        callback(rows);
    });
};

// Get a single transaction by ID
exports.getById = function(id, callback) {
    var strQuery = "SELECT * FROM transactions " +
                   "WHERE id='" + id + "'";
    console.log(strQuery);

    this.conn.query(strQuery, function(err, rows, fields) {
        if (err) throw err;
 
        callback(rows);
    });
};

// Get the categories
exports.getCategories = function(callback) {
    var strQuery = "SELECT * FROM categories ORDER BY id";
    console.log(strQuery);

    this.conn.query(strQuery, function(err, rows, fields) {
        if (err) throw err;

        callback(rows);
    });
};

// Insert a new transaction given a date (year, month, day)
exports.insert = function(year, month, day, description, category, amount, callback) {
    var strQuery = "INSERT INTO transactions (date, description, category, amount) " +
                   "VALUES (DATE('" + year  + "-" + month + "-" + day + "'),'" + description + "','" + category + "','" + amount + "')";
    console.log(strQuery);

    this.conn.query(strQuery, function(err, rows) {
        if (err) throw err;

        callback(rows.insertId);
    });
};

exports.update = function(id, year, month, day, description, category, amount, callback) {
    var strQuery = "UPDATE transactions " + 
                   "SET date=DATE('" + year  + "-" + month + "-" + day + "'), description='" + description + "', category='" + category + "', amount='" + amount + "' WHERE id='" + id + "'";
    console.log(strQuery);

    this.conn.query(strQuery, function(err, rows) {
        if (err) throw err;

        callback(rows.insertId);
    });
};

exports.delete = function(id, callback) {
    var strQuery = "DELETE FROM transactions WHERE id='" + id + "'";

    console.log(strQuery);

    this.conn.query(strQuery, function(err, rows) {
        if (err) throw err;
        callback(rows);
    });
};
