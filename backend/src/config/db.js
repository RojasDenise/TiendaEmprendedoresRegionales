const { Pool, types } = require('pg');
require('dotenv').config();

/**
 * @fileoverview Conexión a PostgreSQL (driver `pg`).
 *
 * La conexión se configura con una sola variable de entorno, DATABASE_URL
 * (ver .env.example). Es el formato que entrega Neon y la mayoría de los
 * servicios de Postgres:
 *   postgresql://usuario:contraseña@host/base?sslmode=require
 *
 * Uso en services y controllers:
 *   const pool = await getConnection();
 *   const result = await pool.query('SELECT * FROM Producto WHERE id_producto = $1', [id]);
 *   result.rows      -> filas (antes: result.recordset)
 *   result.rowCount  -> filas afectadas (antes: result.rowsAffected[0])
 *
 * @module config/db
 */

// Por defecto `pg` devuelve estos tipos como texto. Los convertimos para que
// la API siga respondiendo igual que antes:
types.setTypeParser(types.builtins.INT8, (valor) => parseInt(valor, 10));    // COUNT(*) -> número
types.setTypeParser(types.builtins.NUMERIC, (valor) => parseFloat(valor));   // AVG(), SUM() -> número
types.setTypeParser(types.builtins.DATE, (valor) => valor);                  // DATE -> 'AAAA-MM-DD' (sin corrimiento por zona horaria)

// Singleton: instancia única del pool
let pool = null;

const crearPool = () => {
    if (!process.env.DATABASE_URL) {
        throw new Error('Falta la variable de entorno DATABASE_URL (ver backend/.env.example)');
    }

    const nuevoPool = new Pool({
        connectionString: process.env.DATABASE_URL,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
    });

    // Neon suspende la base tras unos minutos sin uso y corta las conexiones
    // que estaban en espera. Sin este manejador, ese corte tiraría abajo el servidor.
    // El pool descarta la conexión rota y abre una nueva en la siguiente consulta.
    nuevoPool.on('error', (error) => {
        console.error('Conexión inactiva a la base cerrada:', error.message);
    });

    return nuevoPool;
};

/**
 * Devuelve el pool de conexiones (lo crea la primera vez).
 * La primera llamada además verifica que la base responda.
 *
 * @returns {Promise<import('pg').Pool>}
 */
const getConnection = async () => {
    if (!pool) {
        const nuevoPool = crearPool();
        try {
            await nuevoPool.query('SELECT 1');
        } catch (error) {
            await nuevoPool.end().catch(() => {});
            console.error('Error de conexión:', error.message);
            throw error;
        }
        pool = nuevoPool;
        console.log('Conexión exitosa a la base de datos');
    }
    return pool;
};

module.exports = { getConnection };
