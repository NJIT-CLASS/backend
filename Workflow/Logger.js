const winston = require('winston');
var moment = require('moment');

var logger = new(winston.Logger)({
    levels: {
        error: 0,
        info: 1,
        debug: 2
    },
    transports: [
        new(winston.transports.Console)({
            level: 'debug',
            colorize: true,
            timestamp: function () {
                return moment().format('YYYY-MM-DD HH:mm:ss');
            }
            // json: true,
        }),
        new(winston.transports.File)({
            name: 'info-file',
            filename: 'logs/filelog-info.log',
            level: 'info',
        }),
        new(winston.transports.File)({
            name: 'debug-file',
            filename: 'logs/filelog-debug.log',
            level: 'debug',
        }),
        new(winston.transports.File)({
            name: 'error-file',
            filename: 'logs/filelog-error.log',
            level: 'error',
        })
    ]
});


module.exports = logger;