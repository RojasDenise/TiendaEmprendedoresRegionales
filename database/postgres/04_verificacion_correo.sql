-- =====================================================================
-- 04 - Verificación de correo y recuperación de contraseña
-- =====================================================================
-- Agrega:
--   email_verificado (en Cliente y Usuario): si la persona ya confirmó su
--     correo con el enlace que le llega al registrarse. Sin confirmar no
--     puede iniciar sesión.
--   TokenCorreo: los enlaces de un solo uso que se mandan por mail
--     (confirmar la cuenta y restablecer la contraseña).
--
-- CORRER ESTE SCRIPT EN NEON ANTES DE PUBLICAR EL BACKEND NUEVO:
-- el login ya lee email_verificado, y sin la columna falla.
--
-- Se puede correr más de una vez sin problema (IF NOT EXISTS).
-- Las cuentas que ya existían quedan como verificadas, para que nadie que
-- ya usaba la tienda se quede afuera.
-- =====================================================================

ALTER TABLE Cliente
  ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE Usuario
  ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN NOT NULL DEFAULT FALSE;

-- Cuentas previas a este cambio: se dan por verificadas.
-- (Solo las creadas antes de que existiera la tabla de tokens, así correr el
-- script de nuevo no verifica a quien se registró después.)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tokencorreo') THEN
    UPDATE Cliente SET email_verificado = TRUE;
    UPDATE Usuario SET email_verificado = TRUE;
  END IF;
END $$;

-- En la base nunca se guarda el enlace en sí, solo su huella (SHA-256):
-- si alguien llegara a leer la tabla, no podría usar los enlaces.
CREATE TABLE IF NOT EXISTS TokenCorreo (
  id_token    SERIAL PRIMARY KEY,
  tipo        VARCHAR(20) NOT NULL CHECK (tipo IN ('verificacion', 'recuperacion')),
  tabla       VARCHAR(10) NOT NULL CHECK (tabla IN ('Usuario', 'Cliente')),
  id_cuenta   INT         NOT NULL,
  token_hash  CHAR(64)    NOT NULL UNIQUE,
  expira_en   TIMESTAMPTZ NOT NULL,
  usado_en    TIMESTAMPTZ NULL,
  creado_en   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_tokencorreo_cuenta ON TokenCorreo (tabla, id_cuenta, tipo);
