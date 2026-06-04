const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Singleton: instancia única del pool
let pool = null;

const getConnection = async () => {
    try {
        if (!pool) {
            pool = await sql.connect(dbConfig);
            console.log("Conexión exitosa a la base de datos");
        }
        return pool;
    } catch (error) {
        console.error("Error de conexión:", error);
        throw error;
    }
};

module.exports = { getConnection };