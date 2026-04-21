

use TiendaEmprendedoresRegionales;


SELECT * FROM categoria;
SELECT * FROM Rol;
SELECT * FROM Estado;
SELECT * FROM Usuario;
SELECT * FROM Producto;
SELECT * FROM Cliente;
SELECT * FROM Carrito;
SELECT * FROM Factura;
SELECT * FROM Pago;
SELECT * FROM estado_envio;
SELECT * FROM Envio;
SELECT * FROM Estado_Reclamo;
SELECT * FROM Mensaje_Reclamo;
SELECT * FROM Reclamo;
SELECT * FROM Item_Carrito;
SELECT * FROM Valoración;
SELECT * FROM Estado_Producto;

CREATE TABLE Categoria (
    id_categoria INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE Rol (
    id_rol INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE Estado (
    id_estado INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE Estado_Producto (
    id_estado_prod INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

-- 3. TABLAS DE USUARIOS Y CLIENTES
CREATE TABLE Usuario (
    id_usuario INT IDENTITY(1,1) PRIMARY KEY,
    apellidoNombre VARCHAR(50) NOT NULL,
    DNI INT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    email VARCHAR(50) NOT NULL,
    contraseña VARCHAR(255) NOT NULL, 
    id_rol INT NOT NULL,
    id_estado INT NOT NULL,
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol),
    FOREIGN KEY (id_estado) REFERENCES Estado(id_estado)
);

--Se cambia el estado de emprendedor a activo
UPDATE Usuario SET id_estado = 1 WHERE email = 'lopezantonela@tienda.com'

CREATE TABLE Cliente (
    id_cliente INT IDENTITY(1,1) PRIMARY KEY,
    apellidoNombre VARCHAR(50) NOT NULL,
    DNI INT NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    email VARCHAR(50) NOT NULL,
    contraseña VARCHAR(255) NOT NULL, -- Ya con tamaño para Bcrypt
);

-- 4. TABLA DE PRODUCTOS
CREATE TABLE Producto (
    id_producto INT IDENTITY(1,1) PRIMARY KEY, 
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(200) NOT NULL,
    precio FLOAT NOT NULL,
    stock INT NOT NULL,
    id_categoria INT NOT NULL,
    id_usuario INT NOT NULL,
    id_estado_prod INT NOT NULL DEFAULT 1,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_estado_prod) REFERENCES Estado_Producto(id_estado_prod)
);
ALTER TABLE Producto ADD imagen VARCHAR(255) NULL;---nuevo para imagen

-- 5. TABLAS DE VENTA
CREATE TABLE Carrito (
    id_carrito INT IDENTITY(1,1) PRIMARY KEY,
    fecha_creacion DATE NOT NULL,
    id_cliente INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE Item_Carrito (
    id_itemCarrito INT IDENTITY(1,1) PRIMARY KEY,
    cantidad INT NOT NULL,
    precio FLOAT NOT NULL,
    id_producto INT NOT NULL,
    id_carrito INT NOT NULL,
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto),
    FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito)
);

CREATE TABLE Factura (
    id_factura INT IDENTITY(1,1) PRIMARY KEY,
    fecha DATE NOT NULL,
    total FLOAT NOT NULL,
    id_carrito INT NOT NULL,
    FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito)
);

CREATE TABLE Pago (
    id_pago INT IDENTITY(1,1) PRIMARY KEY,
    fecha DATE NOT NULL,
    formaPago VARCHAR(50) NOT NULL,
    montoTotal FLOAT NOT NULL,
    estado VARCHAR(50) NOT NULL,
    id_factura INT NOT NULL,
    FOREIGN KEY (id_factura) REFERENCES Factura(id_factura)
);

-- 6. ENVÍOS Y RECLAMOS
CREATE TABLE estado_envio (
    id_estado_envio INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE Envio (
    id_envio INT IDENTITY(1,1) PRIMARY KEY,
    fecha_envio DATE NOT NULL,
    fecha_entrega DATE NOT NULL,
    id_carrito INT NOT NULL,
    id_estado_envio INT NOT NULL,
    FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito),
    FOREIGN KEY (id_estado_envio) REFERENCES estado_envio(id_estado_envio)
);

CREATE TABLE Estado_Reclamo (
    id_estadoReclamo INT IDENTITY(1,1) PRIMARY KEY,
    descripcion VARCHAR(50) NOT NULL
);

CREATE TABLE Mensaje_Reclamo (
    id_mensaje INT IDENTITY(1,1) PRIMARY KEY,
    contenido VARCHAR(200) NOT NULL,
    fecha_envio DATE NOT NULL,
    id_usuario INT NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Reclamo (
    id_reclamo INT IDENTITY(1,1) PRIMARY KEY,
    fecha_reclamo DATE NOT NULL,
    motivo VARCHAR(200) NOT NULL,
    id_estadoReclamo INT NOT NULL,
    id_mensaje INT NOT NULL,
    id_factura INT NOT NULL,
    id_cliente INT NOT NULL,
    FOREIGN KEY (id_estadoReclamo) REFERENCES Estado_Reclamo(id_estadoReclamo),
    FOREIGN KEY (id_mensaje) REFERENCES Mensaje_Reclamo(id_mensaje),
    FOREIGN KEY (id_factura) REFERENCES Factura(id_factura),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE Valoración (
    id_valoracion INT IDENTITY(1,1) PRIMARY KEY,
    puntaje INT NOT NULL,
    comentario VARCHAR(200) NOT NULL,
    fecha DATE NOT NULL,
    id_cliente INT NOT NULL,
    id_factura INT NOT NULL,
    id_producto INT NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    FOREIGN KEY (id_factura) REFERENCES Factura(id_factura),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

-- 7. INSERTAR DATOS INICIALES
INSERT INTO Rol (descripcion) VALUES ('Admin'), ('Emprendedor'), ('Cliente');
INSERT INTO Estado (descripcion) VALUES ('Activo'), ('Pendiente'), ('Inactivo');
INSERT INTO Estado_Producto (descripcion) VALUES ('Activo'), ('Inactivo');
INSERT INTO Categoria (descripcion) VALUES ('General');


