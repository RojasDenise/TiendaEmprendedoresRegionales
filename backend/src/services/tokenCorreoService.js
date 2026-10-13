const crypto = require('crypto');

/**
 * @fileoverview Enlaces de un solo uso que se mandan por correo.
 *
 * El enlace lleva un token aleatorio de 32 bytes. En la base se guarda solo
 * su huella SHA-256: con la tabla sola no se puede reconstruir el enlace.
 * Cada token vence, sirve una vez, y al pedir uno nuevo se anulan los
 * anteriores del mismo tipo para esa cuenta.
 *
 * @module tokenCorreoService
 */

/** Validez de cada tipo de enlace, en horas. */
const VIGENCIA_HORAS = { verificacion: 48, recuperacion: 1 };

const huella = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Crea un token nuevo para una cuenta y anula los anteriores sin usar.
 *
 * @param {import('pg').Pool} pool
 * @param {{ tipo: 'verificacion'|'recuperacion', tabla: 'Usuario'|'Cliente', idCuenta: number }} datos
 * @returns {Promise<string>} El token en claro, para poner en el enlace.
 */
const crearToken = async (pool, { tipo, tabla, idCuenta }) => {
  const token = crypto.randomBytes(32).toString('base64url');

  await pool.query(
    `UPDATE TokenCorreo SET usado_en = NOW()
      WHERE tabla = $1 AND id_cuenta = $2 AND tipo = $3 AND usado_en IS NULL`,
    [tabla, idCuenta, tipo]
  );
  await pool.query(
    `INSERT INTO TokenCorreo (tipo, tabla, id_cuenta, token_hash, expira_en)
     VALUES ($1, $2, $3, $4, NOW() + make_interval(hours => $5))`,
    [tipo, tabla, idCuenta, huella(token), VIGENCIA_HORAS[tipo]]
  );

  return token;
};

/**
 * Marca el token como usado y devuelve a qué cuenta pertenece.
 * El UPDATE es atómico: si dos pedidos llegan juntos, solo uno lo consume.
 *
 * @param {import('pg').Pool | import('pg').PoolClient} db
 * @param {string} token
 * @param {'verificacion'|'recuperacion'} tipo
 * @returns {Promise<{ tabla: 'Usuario'|'Cliente', id_cuenta: number } | null>}
 *   null si no existe, venció o ya se usó.
 */
const consumirToken = async (db, token, tipo) => {
  if (typeof token !== 'string' || token.length < 20 || token.length > 100) return null;

  const resultado = await db.query(
    `UPDATE TokenCorreo SET usado_en = NOW()
      WHERE token_hash = $1 AND tipo = $2 AND usado_en IS NULL AND expira_en > NOW()
      RETURNING tabla, id_cuenta`,
    [huella(token), tipo]
  );
  return resultado.rows[0] || null;
};

module.exports = { crearToken, consumirToken };
