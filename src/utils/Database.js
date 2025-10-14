import { createClient } from '@libsql/client';

// Create Turso client using environment variables
const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Execute a SELECT query that returns multiple rows
 */
export async function queryDB(sql, params = []) {
    try {
        const result = await client.execute({ sql, args: params });
        return result.rows.map(row => {
            const obj = {};
            result.columns.forEach((col, index) => {
                obj[col] = row[index];
            });
            return obj;
        });
    } catch (error) {
        throw error;
    }
}

/**
 * Execute a SELECT query that returns a single row
 */
export async function queryOne(sql, params = []) {
    try {
        const result = await client.execute({ sql, args: params });
        if (result.rows.length === 0) return undefined;
        
        const obj = {};
        result.columns.forEach((col, index) => {
            obj[col] = result.rows[0][index];
        });
        return obj;
    } catch (error) {
        throw error;
    }
}

/**
 * Execute INSERT, UPDATE, or DELETE operations
 */
export async function updateDB(sql, params = []) {
    try {
        const result = await client.execute({ sql, args: params });
        return {
            changes: result.rowsAffected,
            lastID: result.lastInsertRowid
        };
    } catch (error) {
        throw error;
    }
}

/**
 * Execute multiple operations in a transaction
 */
export async function runTransaction(operations) {
    const transaction = await client.transaction();
    
    try {
        let results = [];
        
        for (let i = 0; i < operations.length; i++) {
            const { sql, params = [], type = 'run' } = operations[i];
            
            try {
                const result = await transaction.execute({ sql, args: params });
                
                if (type === 'get') {
                    if (result.rows.length === 0) {
                        results[i] = undefined;
                    } else {
                        const obj = {};
                        result.columns.forEach((col, index) => {
                            obj[col] = result.rows[0][index];
                        });
                        results[i] = obj;
                    }
                } else if (type === 'all') {
                    results[i] = result.rows.map(row => {
                        const obj = {};
                        result.columns.forEach((col, index) => {
                            obj[col] = row[index];
                        });
                        return obj;
                    });
                } else {
                    // Default to 'run' for INSERT/UPDATE/DELETE
                    results[i] = {
                        changes: result.rowsAffected,
                        lastID: result.lastInsertRowid
                    };
                }
            } catch (opError) {
                await transaction.rollback();
                throw {
                    errors: [{ index: i, error: opError.message }],
                    partialResults: results
                };
            }
        }
        
        await transaction.commit();
        return results;
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
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
            dbPath: process.env.TURSO_DATABASE_URL
        };
    } catch (error) {
        throw new Error(`Database info error: ${error.message}`);
    }
}