import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = process.env.NODE_ENV === 'production' 
    ? ':memory:' : path.join(process.cwd(), 'src/data/jewellery.db'); 

/**
 * Execute a SELECT query that returns multiple rows
 */
export function queryDB(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
            db.close();
        });
    });
}

/**
 * Execute a SELECT query that returns a single row
 */
export function queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.get(sql, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
            db.close();
        });
    });
}

/**
 * Execute INSERT, UPDATE, or DELETE operations
 */
export function updateDB(sql, params = []) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ 
                    changes: this.changes,
                    lastID: this.lastID 
                });
            }
            db.close();
        });
    });
}

/**
 * Execute multiple operations in a transaction
 */
export function runTransaction(operations) {
    return new Promise((resolve, reject) => {
        const db = new sqlite3.Database(DB_PATH);
        
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");
            
            let results = [];
            let errors = [];
            let completed = 0;
            
            operations.forEach((op, index) => {
                const { sql, params = [], type = 'run' } = op;
                
                if (type === 'get') {
                    db.get(sql, params, (err, row) => {
                        if (err) {
                            errors.push({ index, error: err.message });
                        } else {
                            results[index] = row;
                        }
                        completed++;
                        checkCompletion();
                    });
                } else if (type === 'all') {
                    db.all(sql, params, (err, rows) => {
                        if (err) {
                            errors.push({ index, error: err.message });
                        } else {
                            results[index] = rows;
                        }
                        completed++;
                        checkCompletion();
                    });
                } else {
                    // Default to 'run' for INSERT/UPDATE/DELETE
                    db.run(sql, params, function(err) {
                        if (err) {
                            errors.push({ index, error: err.message });
                        } else {
                            results[index] = { 
                                changes: this.changes, 
                                lastID: this.lastID 
                            };
                        }
                        completed++;
                        checkCompletion();
                    });
                }
            });
            
            function checkCompletion() {
                if (completed === operations.length) {
                    if (errors.length > 0) {
                        db.run("ROLLBACK", () => {
                            db.close();
                            reject({ errors, partialResults: results });
                        });
                    } else {
                        db.run("COMMIT", (commitErr) => {
                            db.close();
                            if (commitErr) {
                                reject({ error: "Commit failed", details: commitErr.message });
                            } else {
                                resolve(results);
                            }
                        });
                    }
                }
            }
        });
    });
}

/**
 * Get database info/stats
 */
export async function getDBInfo() {
    try {
        const tables = await queryDB(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
            ORDER BY name
        `);
        
        const views = await queryDB(`
            SELECT name FROM sqlite_master 
            WHERE type='view' 
            ORDER BY name
        `);
        
        return {
            tables: tables.map(t => t.name),
            views: views.map(v => v.name),
            dbPath: DB_PATH
        };
    } catch (error) {
        throw new Error(`Database info error: ${error.message}`);
    }
}