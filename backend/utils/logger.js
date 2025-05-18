const winston = require("winston")
const path = require("path")
const fs = require("fs")
const config = require("../config/config")

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "..", "logs")
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true })
}

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
)

// Define transports
const transports = [
  // Write all logs with level 'error' and below to error.log
  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
  }),
  // Write all logs to combined.log
  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
  }),
]

// If we're not in production, also log to the console
if (config.env !== "production") {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), winston.format.simple()),
    }),
  )
}

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: "document-management" },
  transports,
})

module.exports = logger
