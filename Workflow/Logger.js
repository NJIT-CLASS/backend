const winston = require('winston');
var moment = require('moment');
require('winston-daily-rotate-file');

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
        // new(winston.transports.File)({
        //     name: 'info-file',
        //     filename: 'logs/filelog-info.log',
        //     level: 'info',
        // }),
        // new(winston.transports.File)({
        //     name: 'debug-file',
        //     filename: 'logs/filelog-debug.log',
        //     level: 'debug',
        // }),
        // new(winston.transports.File)({
        //     name: 'error-file',
        //     filename: 'logs/filelog-error.log',
        //     level: 'error',
        // }),
        new (winston.transports.DailyRotateFile)({
            name: 'debug-file',
            datePattern: 'yyyy-MM-dd.',
            filename: 'logs/filelog-debug.log',
            prepend: true,
            level: 'debug'
        }),
        new (winston.transports.DailyRotateFile)({
            name: 'info-file',
            datePattern: 'yyyy-MM-dd.',
            filename: 'logs/filelog-info.log',
            prepend: true,
            level: 'info'
        }),
        new (winston.transports.DailyRotateFile)({
            name: 'error-file',
            datePattern: 'yyyy-MM-dd.',
            filename: 'logs/filelog-error.log',
            prepend: true,
            level: 'error'
        })
    ]
});



module.exports = logger;