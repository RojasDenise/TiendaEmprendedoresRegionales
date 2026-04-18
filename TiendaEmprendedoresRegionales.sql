--CREATE TABLE Categoria

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
(
  id_categoria INT NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_categoria)
);

CREATE TABLE Rol
(
  id_rol INT NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_rol)
);

CREATE TABLE Estado
(
  id_estado INT NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_estado)
);

CREATE TABLE Usuario
(
  id_usuario INT NOT NULL,
  apellidoNombre VARCHAR(50) NOT NULL,
  DNI INT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  email VARCHAR(50) NOT NULL,
  contraseña VARCHAR(50) NOT NULL,
  id_rol INT NOT NULL,
  id_estado INT NOT NULL,
  PRIMARY KEY (id_usuario),
  FOREIGN KEY (id_rol) REFERENCES Rol(id_rol),
  FOREIGN KEY (id_estado) REFERENCES Estado(id_estado)
);

CREATE TABLE Producto
(
  id_producto INT NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  precio FLOAT NOT NULL,
  stock INT NOT NULL,
  id_categoria INT NOT NULL,
  id_usuario INT NOT NULL,
  PRIMARY KEY (id_producto),
  FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria),
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Cliente
(
  id_cliente INT NOT NULL,
  apellidoNombre VARCHAR(50) NOT NULL,
  DNI INT NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  email VARCHAR(50) NOT NULL,
  contraseña VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_cliente)
);

CREATE TABLE Carrito
(
  id_carrito INT NOT NULL,
  fecha_creacion DATE NOT NULL,
  id_cliente INT NOT NULL,
  PRIMARY KEY (id_carrito),
  FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE Factura
(
  id_factura INT NOT NULL,
  fecha DATE NOT NULL,
  total FLOAT NOT NULL,
  id_carrito INT NOT NULL,
  PRIMARY KEY (id_factura),
  FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito)
);

CREATE TABLE Pago
(
  id_pago INT NOT NULL,
  fecha DATE NOT NULL,
  formaPago VARCHAR(50) NOT NULL,
  montoTotal FLOAT NOT NULL,
  estado VARCHAR(50) NOT NULL,
  id_factura INT NOT NULL,
  PRIMARY KEY (id_pago),
  FOREIGN KEY (id_factura) REFERENCES Factura(id_factura)
);

CREATE TABLE estado_envio
(
  id_estado_envio INT NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_estado_envio)
);

CREATE TABLE Envio
(
  id_envio INT NOT NULL,
  fecha_envio DATE NOT NULL,
  fecha_entrega DATE NOT NULL,
  id_carrito INT NOT NULL,
  id_estado_envio INT NOT NULL,
  PRIMARY KEY (id_envio),
  FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito),
  FOREIGN KEY (id_estado_envio) REFERENCES estado_envio(id_estado_envio)
);

CREATE TABLE Estado_Reclamo
(
  id_estadoReclamo INT NOT NULL,
  descripcion VARCHAR(50) NOT NULL,
  PRIMARY KEY (id_estadoReclamo)
);

CREATE TABLE Mensaje_Reclamo
(
  id_mensaje INT NOT NULL,
  contenido VARCHAR(200) NOT NULL,
  fecha_envio DATE NOT NULL,
  id_usuario INT NOT NULL,
  PRIMARY KEY (id_mensaje),
  FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

CREATE TABLE Reclamo
(
  id_reclamo INT NOT NULL,
  fecha_reclamo DATE NOT NULL,
  motivo VARCHAR(200) NOT NULL,
  id_estadoReclamo INT NOT NULL,
  id_mensaje INT NOT NULL,
  id_factura INT NOT NULL,
  id_cliente INT NOT NULL,
  PRIMARY KEY (id_reclamo),
  FOREIGN KEY (id_estadoReclamo) REFERENCES Estado_Reclamo(id_estadoReclamo),
  FOREIGN KEY (id_mensaje) REFERENCES Mensaje_Reclamo(id_mensaje),
  FOREIGN KEY (id_factura) REFERENCES Factura(id_factura),
  FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE Item_Carrito
(
  id_itemCarrito INT NOT NULL,
  cantidad INT NOT NULL,
  precio FLOAT NOT NULL,
  id_producto INT NOT NULL,
  id_carrito INT NOT NULL,
  PRIMARY KEY (id_itemCarrito, id_producto, id_carrito),
  FOREIGN KEY (id_producto) REFERENCES Producto(id_producto),
  FOREIGN KEY (id_carrito) REFERENCES Carrito(id_carrito)
);

CREATE TABLE Valoración
(
  id_valoracion INT NOT NULL,
  puntaje INT NOT NULL,
  comentario VARCHAR(200) NOT NULL,
  fecha DATE NOT NULL,
  id_cliente INT NOT NULL,
  id_factura INT NOT NULL,
  id_producto INT NOT NULL,
  PRIMARY KEY (id_valoracion),
  FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
  FOREIGN KEY (id_factura) REFERENCES Factura(id_factura),
  FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);