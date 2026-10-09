-- =====================================================================
-- 03 - Constancia de aceptación de la Política de Privacidad y los Términos
-- =====================================================================
-- Agrega a las cuentas dos datos:
--   acepto_terminos_en : fecha y hora en que la persona aceptó al registrarse
--   version_terminos   : qué versión de los textos aceptó (ej. '2026-10-09')
--
-- CORRER ESTE SCRIPT EN NEON ANTES DE PUBLICAR EL BACKEND NUEVO:
-- el registro de cuentas ya escribe en estas columnas, y sin ellas falla.
--
-- Se puede correr más de una vez sin problema (IF NOT EXISTS).
-- Las cuentas que ya existían quedan con los dos campos en NULL:
-- se crearon antes de que hubiera política publicada.
--
-- Orden para una base nueva: 01_esquema.sql, 02_datos_de_prueba.sql, 03_consentimiento.sql
-- =====================================================================

ALTER TABLE Cliente
  ADD COLUMN IF NOT EXISTS acepto_terminos_en TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS version_terminos   VARCHAR(20) NULL;

ALTER TABLE Usuario
  ADD COLUMN IF NOT EXISTS acepto_terminos_en TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS version_terminos   VARCHAR(20) NULL;
