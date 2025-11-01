import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.local.DB_HOST,
    port: process.env.local.DB_PORT,
    user: process.env.local.DB_USER,
    password: process.env.local.DB_PASSWORD,
    database: process.env.local.DB_HOST,
    ssl: false
});

export default pool;