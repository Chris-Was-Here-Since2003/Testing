import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

// Initialize SQL database file path
const DB_FILE = path.join(process.cwd(), "data.db");

// Initialize sqlite3 database connection
export const db = new sqlite3.Database(DB_FILE, (err) => {
  if (err) {
    console.error("Failed to connect to SQLite data.db:", err);
  } else {
    console.log("Connected to SQL database (SQLite) successfully at data.db");
    initializeTables();
  }
});

// Create tables in SQL format
function initializeTables() {
  db.serialize(() => {
    // 1. Users Table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error("Error creating users table in SQL database:", err);
      } else {
        console.log("SQL Table 'users' verified/created.");
      }
    });

    // 2. Analyses Table (Relational User Storage)
    db.run(`
      CREATE TABLE IF NOT EXISTS analyses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        parsed_data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `, (err) => {
      if (err) {
        console.error("Error creating analyses table in SQL database:", err);
      } else {
        console.log("SQL Table 'analyses' verified/created.");
      }
    });
  });
}

// Relational query helper functions with callbacks wrapped in Promises for async/await
export function sqlGet<T>(query: string, params: any[] = []): Promise<T | null> {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve((row as T) || null);
      }
    });
  });
}

export function sqlAll<T>(query: string, params: any[] = []): Promise<T[]> {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve((rows as T[]) || []);
      }
    });
  });
}

export function sqlRun(query: string, params: any[] = []): Promise<{ lastId: any; changes: number }> {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastId: this.lastID, changes: this.changes });
      }
    });
  });
}
