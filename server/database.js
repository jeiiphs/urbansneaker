import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'database.sqlite');

// Delete corrupted database if it exists
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
}

export const createDbConnection = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        reject(err);
      } else {
        console.log('Connected to SQLite database');
        resolve(db);
      }
    });
  });
};

export const initializeDatabase = async () => {
  const db = await createDbConnection();

  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Create users table
        await runQuery(db, `
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone TEXT,
            is_admin INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create sneakers table
        await runQuery(db, `
          CREATE TABLE IF NOT EXISTS sneakers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            brand TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            image_url TEXT,
            description TEXT,
            stock INTEGER NOT NULL DEFAULT 0,
            style TEXT,
            sizes TEXT NOT NULL DEFAULT '[]',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Create orders table
        await runQuery(db, `
          CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            total DECIMAL(10,2) NOT NULL,
            status TEXT NOT NULL,
            shipping_address TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        `);

        // Create order items table
        await runQuery(db, `
          CREATE TABLE IF NOT EXISTS order_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id TEXT NOT NULL,
            sneaker_id INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            size TEXT NOT NULL,
            price DECIMAL(10,2) NOT NULL,
            FOREIGN KEY (order_id) REFERENCES orders(id),
            FOREIGN KEY (sneaker_id) REFERENCES sneakers(id)
          )
        `);

        // Create promotions table
        await runQuery(db, `
          CREATE TABLE IF NOT EXISTS promotions (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            discount_percentage INTEGER NOT NULL,
            valid_until DATE NOT NULL,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Check if admin exists
        const adminExists = await getRow(db, 'SELECT id FROM users WHERE is_admin = 1');
        
        if (!adminExists) {
          // Create admin user
          const hashedPassword = await bcrypt.hash('admin123', 10);
          await runQuery(db, `
            INSERT INTO users (id, email, password, first_name, last_name, is_admin)
            VALUES (?, ?, ?, ?, ?, ?)
          `, ['1', 'admin@example.com', hashedPassword, 'Admin', 'User', 1]);
          
          console.log('Admin user created successfully');
        }

        resolve();
      } catch (error) {
        console.error('Database initialization error:', error);
        reject(error);
      } finally {
        db.close();
      }
    });
  });
};

const runQuery = (db, query, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        resolve(this);
      }
    });
  });
};

const getRow = (db, query, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        console.error('Database error:', err);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

export { runQuery, getRow };