const pool = require("./pool");

async function insertTable() {
  try {
    const client = await pool.connect();
    await client.query(`
      CREATE TABLE users (
   id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
   username VARCHAR ( 255 ),
   password VARCHAR ( 255 )
);
    `);
    console.log("connection successful");
    client.release();
  } catch (err) {
    console.error("Error executing query", err.stack);
  }
}

insertTable();