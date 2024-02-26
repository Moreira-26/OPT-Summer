const Pool = require('pg').Pool
const db = new Pool({
  user: 'postgres',
  host: 'postgres',
  database: 'postgres',
  password: 'pg!password',
  port: 5432,
})

module.exports = db