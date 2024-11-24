//actual connection is in app.js , I have made this and populate.js file just to get started
const { Pool } = require("pg");
require("dotenv").config();
module.exports = new Pool({
    connectionString: `postgresql://postgres:${process.env.USER}@autorack.proxy.rlwy.net:27605/railway`,
  });