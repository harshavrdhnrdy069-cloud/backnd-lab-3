const fs = require("fs");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const dbPath = path.join(__dirname, "database.db");
const sqlPath = path.join(__dirname, "database.sql");

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
        return reject(err);
      }
      console.log("Connected to SQLite database at:", dbPath);
    });

    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    db.exec(sqlContent, (err) => {
      if (err) {
        console.error("Error executing SQL script:", err.message);
        db.close();
        return reject(err);
      }
      console.log("Database initialized: 'book' table ready and seed records inserted successfully!");

      db.all("SELECT * FROM book", [], (err, rows) => {
        if (err) {
          console.error("Error fetching records:", err.message);
        } else {
          console.log(`Verified: ${rows.length} records in 'book' table:`);
          console.table(rows);
        }
        db.close((closeErr) => {
          if (closeErr) return reject(closeErr);
          resolve();
        });
      });
    });
  });
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log("Database initialization completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Database initialization failed:", err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase, dbPath };
