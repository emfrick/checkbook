var config = {};

config.database= {};
config.app = {};

config.database.name = process.env.DB_NAME || "test";
config.database.user = process.env.DB_USER || "root";
config.database.password = process.env.DB_PASS || "password";
config.database.socket = "/opt/mysql/mysql.sock";

config.app.environment = process.env.APP_ENV || "development";
config.app.port = process.env.LISTEN_PORT || 8080;
config.app.address = process.env.ADDRESS || "localhost";

module.exports = config;
