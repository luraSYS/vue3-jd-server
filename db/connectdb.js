const mysql = require('mysql2')
const config = require('../config/config')
const db = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
})

module.exports = db
