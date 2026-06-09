use TiendaEmprendedoresRegionales;

-- Nivel 1: Tablas Maestras y Configuraciones
SELECT * FROM Rol;
SELECT * FROM Estado;
SELECT * FROM Categoria;
SELECT * FROM Estado_Producto;
SELECT * FROM Estado_pedido;
SELECT * FROM estado_envio;
SELECT * FROM Estado_Reclamo;
SELECT * FROM EstadoPago;
SELECT * FROM FormaPago;
SELECT * FROM Provincia;
SELECT * FROM Tipo_envio;

-- Nivel 2: Entidades de Usuario y Localización
SELECT * FROM Cliente;
SELECT * FROM Usuario;
SELECT * FROM Ciudad;

-- Nivel 3: Operaciones de Catálogo y Logística
SELECT * FROM Direccion;
SELECT * FROM Producto;
SELECT * FROM Carrito;
SELECT * FROM Envio;

-- Nivel 4: Transacciones y Post-Venta (RF4 y RF6)
SELECT * FROM ItemCarrito;
SELECT * FROM Pedido;
SELECT * FROM Factura;
SELECT * FROM DetalleFactura;
SELECT * FROM Pago;
SELECT * FROM Mensaje_Reclamo;
SELECT * FROM Reclamo;
SELECT * FROM Valoración;


-- =============================================
-- 1. TABLAS MAESTRAS (Nivel 1)
-- =============================================
CREATE TABLE Rol (
  id_rol INT IDENTITY(1,1) NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  CONSTRAINT PK_Rol PRIMARY KEY (id_rol),
  CONSTRAINT UQ_Rol_Descripcion UNIQUE (descripcion)
);


INSERT INTO Rol (descripcion)
VALUES ('Administrador'), ('Emprendedor');

CREATE TABLE Estado (
  id_estado INT IDENTITY(1,1) NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  CONSTRAINT PK_Estado PRIMARY KEY (id_estado),
  CONSTRAINT UQ_Estado_Descripcion UNIQUE (descripcion),
  CONSTRAINT CK_Estado CHECK (descripcion IN ('Activo', 'Inactivo'))
);

INSERT INTO Estado (descripcion)
VALUES ('Activo'), ('Inactivo');

CREATE TABLE FormaPago (
  id_formaPago INT IDENTITY(1,1) NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  CONSTRAINT PK_FormaPago PRIMARY KEY (id_formaPago),
  CONSTRAINT UQ_FormaPago_Descripcion UNIQUE (descripcion)
);

INSERT INTO FormaPago (descripcion)
VALUES
('Efectivo'),
('Transferencia'),
('Tarjeta'); 

CREATE TABLE Categoria (
  id_categoria INT IDENTITY(1,1) NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  CONSTRAINT PK_Categoria PRIMARY KEY (id_categoria)
);

INSERT INTO Categoria (descripcion)
VALUES
('Artesanías'),
('Accesorios'),
('Gastronomía'),
('Textiles'),
('Decoración');

CREATE TABLE EstadoPago (
  id_estadoPago INT IDENTITY(1,1) NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  CONSTRAINT PK_EstadoPago PRIMARY KEY (id_estadoPago),
  CONSTRAINT UQ_EstadoPago_Descripcion UNIQUE (descripcion),
  CONSTRAINT CK_EstadoPago CHECK (descripcion IN ('Pendiente', 'Aprobado', 'Rechazado', 'Reembolsado'))
);

INSERT INTO EstadoPago (descripcion)
VALUES
('Pendiente'),
('Aprobado'),
('Rechazado'),
('Reembolsado');

CREATE TABLE estado_envio (
  id_estado_envio INT IDENTITY(1,1) NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  CONSTRAINT PK_EstadoEnvio PRIMARY KEY (id_estado_envio),
  CONSTRAINT UQ_EstadoEnvio_Descripcion UNIQUE (descripcion),
  CONSTRAINT CK_EstadoEnvio CHECK (descripcion IN ('En Preparacion', 'En Camino', 'Entregado', 'Cancelado'))
);

INSERT INTO estado_envio (descripcion)
VALUES
('En Preparacion'),
('En Camino'),
('Entregado'),
('Cancelado');

CREATE TABLE Estado_Reclamo (
  id_estadoReclamo INT IDENTITY(1,1) NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  CONSTRAINT PK_EstadoReclamo PRIMARY KEY (id_estadoReclamo),
  CONSTRAINT UQ_EstadoReclamo_Descripcion UNIQUE (descripcion),
  CONSTRAINT CK_EstadoReclamo CHECK (descripcion IN ('Pendiente', 'Resuelto'))
);

INSERT INTO Estado_Reclamo (descripcion)
VALUES
('Pendiente'),
('Resuelto');

CREATE TABLE Estado_Producto (
  id_estado_prod INT IDENTITY(1,1) NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  CONSTRAINT PK_EstadoProducto PRIMARY KEY (id_estado_prod),
  CONSTRAINT UQ_EstadoProd_Descripcion UNIQUE (descripcion),
  CONSTRAINT CK_EstadoProducto CHECK (descripcion IN ('Con Stock', 'Sin Stock', 'Descontinuado'))
);

INSERT INTO Estado_Producto (descripcion)
VALUES
('Con Stock'),
('Sin Stock'),
('Descontinuado');


CREATE TABLE Estado_pedido (
  id_estadoPedido INT IDENTITY(1,1) NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  CONSTRAINT PK_EstadoPedido PRIMARY KEY (id_estadoPedido),
  CONSTRAINT UQ_EstadoPedido_Descripcion UNIQUE (descripcion),
  CONSTRAINT CK_EstadoPedido CHECK (descripcion IN ('Pendiente de Pago', 'Pagado', 'Cancelado'))
);

INSERT INTO Estado_pedido (descripcion)
VALUES
('Pendiente de Pago'),
('Pagado'),
('Cancelado');

CREATE TABLE Provincia (
  id_provincia INT IDENTITY(1,1) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  CONSTRAINT PK_Provincia PRIMARY KEY (id_provincia)
);

CREATE TABLE Tipo_envio (
  id_tipo_envio INT IDENTITY(1,1) NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  costo_base FLOAT NOT NULL,
  CONSTRAINT PK_TipoEnvio PRIMARY KEY (id_tipo_envio),
  CONSTRAINT UQ_TipoEnvio_Descripcion UNIQUE (descripcion)
);

-- =============================================
-- 2. ENTIDADES PRINCIPALES (Nivel 2)
-- =============================================
CREATE TABLE Cliente (
  id_cliente INT IDENTITY(1,1) NOT NULL,
  apellidoNombre VARCHAR(50) NOT NULL,
  DNI INT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  email VARCHAR(50) NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  CONSTRAINT PK_Cliente PRIMARY KEY (id_cliente),
  CONSTRAINT UQ_Cliente_DNI UNIQUE (DNI),
  CONSTRAINT UQ_Cliente_Email UNIQUE (email),
  CONSTRAINT CK_Cliente_DNI CHECK (DNI BETWEEN 10000000 AND 99999999)
);

CREATE TABLE Usuario (
  id_usuario INT IDENTITY(1,1) NOT NULL,
  apellidoNombre VARCHAR(50) NOT NULL,
  DNI INT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  email VARCHAR(50) NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  reseña VARCHAR(255) NULL,
  nombreEmprendimiento VARCHAR(50) NULL,
  id_estado INT NOT NULL,
  id_rol INT NOT NULL,
  fecha_ultima_conexion DATETIME NULL, -- Para auditoría, se determina estado activo/inactivo
  CONSTRAINT PK_Usuario PRIMARY KEY (id_usuario),
  CONSTRAINT FK_Usuario_Estado FOREIGN KEY (id_estado) REFERENCES Estado(id_estado),
  CONSTRAINT FK_Usuario_Rol FOREIGN KEY (id_rol) REFERENCES Rol(id_rol),
  CONSTRAINT UQ_Usuario_DNI UNIQUE (DNI),
  CONSTRAINT UQ_Usuario_Email UNIQUE (email),
  CONSTRAINT CK_Usuario_DNI CHECK (DNI BETWEEN 10000000 AND 99999999)
);

UPDATE Usuario
SET contraseña = '$2b$10$lg14ZWzRxC3hHZrdUW66W.JpmmXb9On4VCN0Ap8u8NOvZnrggOk8K'
WHERE email = 'admin@tienda.com';
INSERT INTO Usuario (
    apellidoNombre,
    DNI,
    fecha_nacimiento,
    email,
    contraseña,
    reseña,
    nombreEmprendimiento,
    id_estado,
    id_rol,
    fecha_ultima_conexion
)
VALUES (
    'Administrador General',
    12345678,
    '1990-01-01',
    'admin@tienda.com',
    '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e',
    NULL,
    NULL,
    1,
    1,
    GETDATE()
);

CREATE TABLE Ciudad (
  id_ciudad INT IDENTITY(1,1) NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  cod_postal INT NOT NULL,
  id_provincia INT NOT NULL,
  CONSTRAINT PK_Ciudad PRIMARY KEY (id_ciudad),
  CONSTRAINT FK_Ciudad_Provincia FOREIGN KEY (id_provincia) REFERENCES Provincia(id_provincia)
);

-- =============================================
-- 3. TABLAS OPERATIVAS Y TRANSACCIONALES
-- =============================================
CREATE TABLE Direccion (
  id_direccion INT IDENTITY(1,1) NOT NULL,
  calle VARCHAR(50) NOT NULL,
  nro INT NOT NULL,
  descripcion VARCHAR(255),
  id_ciudad INT NOT NULL,
  CONSTRAINT PK_Direccion PRIMARY KEY (id_direccion),
  CONSTRAINT FK_Direccion_Ciudad FOREIGN KEY (id_ciudad) REFERENCES Ciudad(id_ciudad)
);

CREATE TABLE Producto (
  id_producto INT IDENTITY(1,1) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  stock INT NOT NULL,
  precio FLOAT NOT NULL,
  imagen VARCHAR(255) NOT NULL,
  id_categoria INT NOT NULL,
  id_estado_prod INT NOT NULL,
  CONSTRAINT PK_Producto PRIMARY KEY (id_producto),
  CONSTRAINT FK_Producto_Categoria FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria),
  CONSTRAINT FK_Producto_Estado FOREIGN KEY (id_estado_prod) REFERENCES Estado_Producto(id_estado_prod),
  CONSTRAINT CK_Producto_Stock CHECK (stock >= 0),
  CONSTRAINT CK_Producto_Precio CHECK (precio > 0)
);
--agregamos la relacion de usuario->producto
ALTER TABLE Producto 
ADD id_usuario INT NOT NULL;
--creamos la relacion fk
ALTER TABLE Producto 
ADD CONSTRAINT FK_Producto_Usuario 
FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario);


CREATE TABLE Carrito (
  id_carrito INT IDENTITY(1,1) NOT NULL,
  fecha_creacion DATETIME NOT NULL,
  subTotal FLOAT NOT NULL,
  id_cliente INT NOT NULL,
  CONSTRAINT PK_Carrito PRIMARY KEY (id_carrito),
  CONSTRAINT FK_Carrito_Cliente FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE ItemCarrito (
  id_itemCarrito INT IDENTITY(1,1) NOT NULL,
  cantidad INT NOT NULL,
  precio FLOAT NOT NULL,
  id_producto INT NOT NULL,
  id_carrito INT NOT NULL,
  CONSTRAINT PK_ItemCarrito PRIMARY KEY (id_itemCarrito),
  CONSTRAINT FK_ItemCarrito_Producto FOREIGN KEY (id_producto) REFERENCES Producto(id_producto),
  CONSTRAINT FK_ItemCarrito_Carrito FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito),
  CONSTRAINT UQ_ItemCarrito_Relacion UNIQUE (id_producto, id_carrito)
);

CREATE TABLE Envio (
  id_envio INT IDENTITY(1,1) NOT NULL,
  fecha_envio DATETIME NOT NULL,
  fecha_entrega DATETIME NULL,
  id_estado_envio INT NOT NULL,
  id_tipo_envio INT NOT NULL,
  CONSTRAINT PK_Envio PRIMARY KEY (id_envio),
  CONSTRAINT FK_Envio_Estado FOREIGN KEY (id_estado_envio) REFERENCES estado_envio(id_estado_envio),
  CONSTRAINT FK_Envio_Tipo FOREIGN KEY (id_tipo_envio) REFERENCES Tipo_envio(id_tipo_envio)
);

CREATE TABLE Pedido (
  id_pedido INT IDENTITY(1,1) NOT NULL,
  fecha_pedido DATETIME NOT NULL,
  id_estadoPedido INT NOT NULL,
  id_envio INT NOT NULL,
  id_cliente INT NOT NULL,
  id_direccion INT NOT NULL,
  CONSTRAINT PK_Pedido PRIMARY KEY (id_pedido),
  CONSTRAINT FK_Pedido_Estado FOREIGN KEY (id_estadoPedido) REFERENCES Estado_pedido(id_estadoPedido),
  CONSTRAINT FK_Pedido_Envio FOREIGN KEY (id_envio) REFERENCES Envio(id_envio),
  CONSTRAINT FK_Pedido_Cliente FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
  CONSTRAINT FK_Pedido_Direccion FOREIGN KEY (id_direccion) REFERENCES Direccion(id_direccion)
);

CREATE TABLE Factura (
  id_factura INT IDENTITY(1,1) NOT NULL,
  fecha DATETIME NOT NULL,
  total FLOAT NOT NULL,
  id_pedido INT NOT NULL,
  CONSTRAINT PK_Factura PRIMARY KEY (id_factura),
  CONSTRAINT FK_Factura_Pedido FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido)
);

CREATE TABLE DetalleFactura (
  id_detalleFactura INT IDENTITY(1,1) NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario FLOAT NOT NULL,
  id_factura INT NOT NULL,
  id_producto INT NOT NULL,
  id_carrito INT NOT NULL,
  CONSTRAINT PK_DetalleFactura PRIMARY KEY (id_detalleFactura),
  CONSTRAINT FK_DetalleFactura_Factura FOREIGN KEY (id_factura) REFERENCES Factura(id_factura)
);

CREATE TABLE Pago (
  id_pago INT IDENTITY(1,1) NOT NULL,
  fecha DATETIME NOT NULL,
  montoTotal FLOAT NOT NULL,
  id_factura INT NOT NULL,
  id_formaPago INT NOT NULL,
  id_estadoPago INT NOT NULL,
  CONSTRAINT PK_Pago PRIMARY KEY (id_pago),
  CONSTRAINT FK_Pago_Factura FOREIGN KEY (id_factura) REFERENCES Factura(id_factura),
  CONSTRAINT FK_Pago_Forma FOREIGN KEY (id_formaPago) REFERENCES FormaPago(id_formaPago),
  CONSTRAINT FK_Pago_Estado FOREIGN KEY (id_estadoPago) REFERENCES EstadoPago(id_estadoPago)
);

-- =============================================
-- 4. SOPORTE Y CALIFICACIÓN
-- =============================================
CREATE TABLE Mensaje_Reclamo (
  id_mensaje INT IDENTITY(1,1) NOT NULL,
  contenido VARCHAR(255) NOT NULL,
  fecha_emision_mensaje DATETIME NOT NULL,
  CONSTRAINT PK_MensajeReclamo PRIMARY KEY (id_mensaje)
);

CREATE TABLE Reclamo (
  id_reclamo INT IDENTITY(1,1) NOT NULL,
  fecha_reclamo DATETIME NOT NULL,
  motivo VARCHAR(255) NOT NULL,
  id_estadoReclamo INT NOT NULL,
  id_mensaje INT NOT NULL,
  id_factura INT NOT NULL,
  id_cliente INT NOT NULL,
  CONSTRAINT PK_Reclamo PRIMARY KEY (id_reclamo),
  CONSTRAINT FK_Reclamo_Estado FOREIGN KEY (id_estadoReclamo) REFERENCES Estado_Reclamo(id_estadoReclamo),
  CONSTRAINT FK_Reclamo_Mensaje FOREIGN KEY (id_mensaje) REFERENCES Mensaje_Reclamo(id_mensaje),
  CONSTRAINT FK_Reclamo_Factura FOREIGN KEY (id_factura) REFERENCES Factura(id_factura),
  CONSTRAINT FK_Reclamo_Cliente FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE Valoración (
  id_valoracion INT IDENTITY(1,1) NOT NULL,
  puntaje INT NOT NULL,
  comentario VARCHAR(255),
  fecha DATETIME NOT NULL,
  id_cliente INT NOT NULL,
  id_factura INT NOT NULL,
  id_producto INT NOT NULL,
  CONSTRAINT PK_Valoracion PRIMARY KEY (id_valoracion),
  CONSTRAINT FK_Valoracion_Cliente FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
  CONSTRAINT FK_Valoracion_Factura FOREIGN KEY (id_factura) REFERENCES Factura(id_factura),
  CONSTRAINT FK_Valoracion_Producto FOREIGN KEY (id_producto) REFERENCES Producto(id_producto),
  CONSTRAINT CK_Puntaje CHECK (puntaje BETWEEN 1 AND 5)
);


-- =============================================
-- Procedimientos almacenados
-- =============================================

-- 1. Consulta de productos
DROP PROCEDURE IF EXISTS sp_obtenerProductos;
GO
CREATE PROCEDURE sp_obtenerProductos
    @id_usuario INT = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        p.id_producto,
        p.nombre,
        p.descripcion,
        p.precio,
        p.stock,
        p.imagen,
        p.id_categoria,
        p.id_usuario,
        p.id_estado_prod,
        c.descripcion        AS categoria_nombre,
        u.apellidoNombre     AS nombre_usuario,
        u.nombreEmprendimiento
    FROM Producto p
    JOIN Categoria c  ON p.id_categoria = c.id_categoria
    LEFT JOIN Usuario u ON p.id_usuario  = u.id_usuario
    WHERE p.id_estado_prod = 1
      AND (@id_usuario IS NULL OR p.id_usuario = @id_usuario);
END;
GO

-- 2. Actualización de producto
DROP PROCEDURE IF EXISTS sp_actualizarProducto;
GO
CREATE PROCEDURE sp_actualizarProducto
    @id_producto INT,
    @nombre VARCHAR(200),
    @descripcion VARCHAR(MAX),
    @precio DECIMAL(10,2),
    @stock INT,
    @id_categoria INT,
    @imagen VARCHAR(255) = NULL
AS
BEGIN
    UPDATE Producto
    SET nombre = @nombre,
        descripcion = @descripcion,
        precio = @precio,
        stock = @stock,
        id_categoria = @id_categoria,
        imagen = ISNULL(@imagen, imagen)
    WHERE id_producto = @id_producto;

    SELECT *
    FROM Producto
    WHERE id_producto = @id_producto;
END;
GO

-- =============================================
-- 3. Trigger: actualización de stock y estado
-- =============================================
DROP TRIGGER IF EXISTS tr_ActualizarStockYEstado;
GO
CREATE TRIGGER tr_ActualizarStockYEstado
ON Pago
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    IF EXISTS (
        SELECT 1
        FROM inserted i
        INNER JOIN EstadoPago ep ON i.id_estadoPago = ep.id_estadoPago
        WHERE ep.descripcion = 'Aprobado'
    )
    BEGIN
        UPDATE p
        SET p.stock = p.stock - df.cantidad
        FROM Producto p
        INNER JOIN DetalleFactura df ON p.id_producto = df.id_producto
        INNER JOIN inserted i ON df.id_factura = i.id_factura
        WHERE i.id_estadoPago = (
            SELECT id_estadoPago FROM EstadoPago WHERE descripcion = 'Aprobado'
        );

        UPDATE Producto
        SET id_estado_prod = (
            SELECT id_estado_prod FROM Estado_Producto WHERE descripcion = 'Sin Stock'
        )
        WHERE stock = 0;
    END
END;
GO

--Modificacion de reclamo
-- 1. Agregar id_reclamo a Mensaje_Reclamo
ALTER TABLE Mensaje_Reclamo
ADD id_reclamo INT NULL;
GO

-- 2. Migrar mensajes existentes usando la relación vieja Reclamo.id_mensaje
UPDATE mr
SET mr.id_reclamo = r.id_reclamo
FROM Mensaje_Reclamo mr
INNER JOIN Reclamo r ON r.id_mensaje = mr.id_mensaje;
GO

-- 3. Eliminar mensajes sin reclamo asociado
DELETE FROM Mensaje_Reclamo
WHERE id_reclamo IS NULL;
GO

-- 4. Cambiar id_reclamo a NOT NULL
ALTER TABLE Mensaje_Reclamo
ALTER COLUMN id_reclamo INT NOT NULL;
GO

-- 5. Crear FK nueva: Mensaje_Reclamo -> Reclamo
ALTER TABLE Mensaje_Reclamo
ADD CONSTRAINT FK_MensajeReclamo_Reclamo
FOREIGN KEY (id_reclamo) REFERENCES Reclamo(id_reclamo);
GO

-- 6. Agregar id_usuario para saber quién escribió el mensaje
ALTER TABLE Mensaje_Reclamo
ADD id_usuario INT NULL;
GO

-- 7. Eliminar la FK vieja Reclamo -> Mensaje_Reclamo
ALTER TABLE Reclamo
DROP CONSTRAINT FK_Reclamo_Mensaje;
GO

-- 8. Eliminar la columna vieja id_mensaje de Reclamo
ALTER TABLE Reclamo
DROP COLUMN id_mensaje;
GO

--modificacion longitud atributos descrip e imagen tabla producto
ALTER TABLE Producto
ALTER COLUMN descripcion VARCHAR(MAX) NOT NULL;
GO

ALTER TABLE Producto
ALTER COLUMN imagen VARCHAR(MAX) NOT NULL;
GO

--modificacion de los estados de reclamo
ALTER TABLE Estado_Reclamo
DROP CONSTRAINT CK_EstadoReclamo;

INSERT INTO Estado_Reclamo (descripcion)
VALUES ('Respondido');

ALTER TABLE Estado_Reclamo
ADD CONSTRAINT CK_EstadoReclamo 
CHECK (descripcion IN ('Pendiente', 'Respondido', 'Resuelto'));




