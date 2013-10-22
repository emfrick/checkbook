var config = {};

config.database= {};
config.app = {};

config.database.hostname = process.env.DB_HOST     || "localhost";
config.database.name     = process.env.DB_NAME     || "test";
config.database.user     = process.env.DB_USER     || "root";
config.database.password = process.env.DB_PASS     || "password";
config.database.socket   = "/opt/mysql/mysql.sock";

config.app.environment   = process.env.APP_ENV     || "development";
config.app.port          = process.env.NODE_PORT   || 8080;
config.app.address       = process.env.NODE_IPADDR || "localhost";

module.exports = config;
