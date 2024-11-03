const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Define the logs directory path at the root of the project
const logsDir = path.join(__dirname, '..', 'logs');

// Ensure the logs directory exists
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
        // Adjust the filename to use the logs directory at the project root
        new winston.transports.File({ filename: path.join(logsDir, 'app.log') })
    ]
});

module.exports = logger;