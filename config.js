var config = {};

config.database= {};
config.app = {};

config.database.hostname = process.env.DB_HOST     || "localhost";
config.database.name     = process.env.DB_NAME     || "test";
config.database.user     = process.env.DB_USER     || "root";
config.database.password = process.env.DB_PASS     || "password";
config.database.socket   = "/opt/mysql/mysql.sock";

config.app.environment   = process.env.NODE_ENV    || "development";
config.app.port          = process.env.PORT        || 8080;
config.app.address       = process.env.NODE_IPADDR || "localhost";

console.log("*** CONFIG ***");
console.log("DB_HOST    : " + process.env.DB_HOST);
console.log("DB_NAME    : " + process.env.DB_NAME);
console.log("DB_USER    : " + process.env.DB_USER);
console.log("NODE_ENV   : " + process.env.NODE_ENV);
console.log("PORT       : " + process.env.PORT);
console.log("NODE_IPADDR: " + process.env.NODE_IPADDR);
console.log("**************");

module.exports = config;
