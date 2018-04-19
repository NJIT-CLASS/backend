exports.DB_HOST = process.env.dbHost || 'localhost';
exports.DB_USER = process.env.dbUser || 'root';
exports.DB_PORT = process.env.dbPort || '3306';
exports.DB_PASS = process.env.dbPass || 'password';
exports.DATABASE = process.env.database || 'sys';
exports.SERVER_PORT = process.env.serverPort || '4000';
exports.FRONT_SERVER_PORT ='4001';
exports.TOKEN_KEY = process.env.tokenSecret || 'secretKey';
exports.TOKEN_LIFE = process.env.tokenLife || '6h';
exports.REFRESH_TOKEN_LIFE = process.env.refreshTokenLife || 14;

