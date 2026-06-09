USE TiendaEmprendedoresRegionales;
GO

-- =============================================
-- DATOS MAESTROS (ya existen en el schema,
-- se incluyen con SET IDENTITY_INSERT por si
-- hay que repoblar desde cero)
-- =============================================
-- Rol: 1=Administrador, 2=Emprendedor
-- Estado: 1=Activo, 2=Inactivo
-- FormaPago: 1=Efectivo, 2=Transferencia, 3=Tarjeta
-- Categoria: 1=Artesanías, 2=Accesorios, 3=Gastronomía, 4=Textiles, 5=Decoración
-- EstadoPago: 1=Pendiente, 2=Aprobado, 3=Rechazado, 4=Reembolsado
-- estado_envio: 1=En Preparacion, 2=En Camino, 3=Entregado, 4=Cancelado
-- Estado_Reclamo: 1=Pendiente, 2=Resuelto, 3=Respondido
-- Estado_Producto: 1=Con Stock, 2=Sin Stock, 3=Descontinuado
-- Estado_pedido: 1=Pendiente de Pago, 2=Pagado, 3=Cancelado

-- =============================================
-- TIPOS DE ENVIO
-- =============================================
INSERT INTO Tipo_envio (descripcion, costo_base) VALUES
('Retiro en punto', 0.00),
('Envío estándar',  850.00),
('Envío express',   1500.00);
GO

-- =============================================
-- PROVINCIAS
-- =============================================
INSERT INTO Provincia (nombre) VALUES
('Corrientes'),
('Misiones'),
('Chaco'),
('Formosa'),
('Entre Ríos');
GO

-- =============================================
-- CIUDADES  (id_provincia referencia el INSERT anterior)
-- id_provincia: 1=Corrientes, 2=Misiones, 3=Chaco, 4=Formosa, 5=Entre Ríos
-- =============================================
INSERT INTO Ciudad (nombre, cod_postal, id_provincia) VALUES
('Corrientes',        3400, 1),
('Goya',              3450, 1),
('Paso de la Patria', 3417, 1),
('Posadas',           3300, 2),
('Oberá',             3360, 2),
('Resistencia',       3500, 3),
('Presidencia Roque Sáenz Peña', 3700, 3),
('Formosa',           3600, 4),
('Paraná',            3100, 5),
('Concordia',         3200, 5);
GO

-- =============================================
-- USUARIOS (Emprendedores)
-- Contraseña: "password123" hasheada con bcrypt rounds=10
-- Hash: $2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e
-- =============================================
INSERT INTO Usuario (apellidoNombre, DNI, fecha_nacimiento, email, contraseña, reseña, nombreEmprendimiento, id_estado, id_rol, fecha_ultima_conexion)
VALUES
('Romero, Laura',      28741523, '1990-03-15', 'laura.romero@emprendedores.com',
 '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e',
 'Artesana correntina con más de 10 años de experiencia en tejidos típicos.',
 'Manos del Iberá', 1, 2, GETDATE()),

('Villalba, Marcos',   31654209, '1988-07-22', 'marcos.villalba@emprendedores.com',
 '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e',
 'Productor de dulces y conservas regionales del litoral.',
 'Sabores del Litoral', 1, 2, GETDATE()),

('Duarte, Sofía',      35120874, '1995-11-08', 'sofia.duarte@emprendedores.com',
 '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e',
 'Diseñadora de accesorios con materiales naturales de la región.',
 'EcoAccesorios NEA', 1, 2, GETDATE()),

('González, Rodrigo',  29874561, '1985-05-30', 'rodrigo.gonzalez@emprendedores.com',
 '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e',
 'Carpintero artesanal especializado en decoración del hogar.',
 'Maderas del Paraná', 1, 2, GETDATE()),

('López, Valentina',   40253698, '2000-09-14', 'valentina.lopez@emprendedores.com',
 '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e',
 'Confeccionista de ropa típica y textiles regionales.',
 'Tejidos Valentina', 1, 2, GETDATE());
GO

-- =============================================
-- CLIENTES
-- Misma contraseña: "password123"
-- =============================================
INSERT INTO Cliente (apellidoNombre, DNI, fecha_nacimiento, email, contraseña)
VALUES
('Fernández, Ana',      32541879, '1993-02-18', 'ana.fernandez@mail.com',
 '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e'),

('Medina, Carlos',      27896543, '1987-06-25', 'carlos.medina@mail.com',
 '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e'),

('Torres, Lucía',       38741256, '1998-12-03', 'lucia.torres@mail.com',
 '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e'),

('Sánchez, Pablo',      33210547, '1991-08-17', 'pablo.sanchez@mail.com',
 '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e'),

('Ramírez, Florencia',  41023698, '2001-04-09', 'florencia.ramirez@mail.com',
 '$2b$10$Dgxwji.1PHDk3GEKGR/Ef0OC2V9mJ5jpxbcVvpJwqNLHMXcAHCu4e');
GO

-- =============================================
-- DIRECCIONES
-- id_ciudad referencia Ciudad insertada arriba:
-- 1=Corrientes, 2=Goya, 3=PdelaPatria, 4=Posadas...
-- =============================================
INSERT INTO Direccion (calle, nro, descripcion, id_ciudad) VALUES
('San Juan',           1450, 'Departamento 3B',          1),
('Av. Tres de Abril',   875, NULL,                       1),
('Pellegrini',          320, 'Casa con portón verde',    2),
('Bolivar',            2100, NULL,                       4),
('Av. Corrientes',      560, 'Esquina con Italia',       6),
('San Martín',         1800, NULL,                       1),
('Alvear',              430, 'Timbre izquierdo',         3),
('Rivadavia',          1025, NULL,                       9);
GO

-- =============================================
-- PRODUCTOS
-- id_usuario: 2=Laura(Manos del Iberá), 3=Marcos(Sabores), 
--             4=Sofía(EcoAccesorios), 5=Rodrigo(Maderas), 6=Valentina(Tejidos)
-- id_categoria: 1=Artesanías,2=Accesorios,3=Gastronomía,4=Textiles,5=Decoración
-- id_estado_prod: 1=Con Stock
-- =============================================
INSERT INTO Producto (nombre, descripcion, stock, precio, imagen, id_categoria, id_estado_prod, id_usuario)
VALUES
-- Manos del Iberá (Laura - id_usuario=2)
('Bolso tejido en fibra de camalote',
 'Bolso artesanal tejido a mano con fibra de camalote, colorido y resistente. Ideal para uso diario.',
 15, 4200.00, 'bolso_camalote.jpg', 1, 1, 2),

('Tapiz decorativo guaraní',
 'Tapiz de pared elaborado con técnicas guaraníes tradicionales, motivos en rojo y negro.',
 8,  3800.00, 'tapiz_guarani.jpg', 5, 1, 2),

-- Sabores del Litoral (Marcos - id_usuario=3)
('Dulce de mamón casero 500g',
 'Dulce de mamón elaborado artesanalmente con fruta fresca de la región. Sin conservantes.',
 30, 850.00,  'dulce_mamon.jpg',   3, 1, 3),

('Mermelada de mburucuyá 350g',
 'Mermelada artesanal de fruta de mburucuyá (maracuyá regional), sabor intenso y natural.',
 25, 720.00,  'mermelada_mburucuya.jpg', 3, 1, 3),

('Licor de miel del Iberá 500ml',
 'Licor artesanal elaborado con miel de apicultores locales y hierbas del Iberá.',
 12, 2100.00, 'licor_miel.jpg',    3, 1, 3),

-- EcoAccesorios NEA (Sofía - id_usuario=4)
('Aretes de semillas de palmera',
 'Aretes livianos y coloridos elaborados con semillas naturales de palmera pindó.',
 40, 1200.00, 'aretes_semillas.jpg', 2, 1, 4),

('Collar de piedras del río',
 'Collar artesanal con piedras semipreciosas recolectadas en el río Paraná.',
 20, 2500.00, 'collar_piedras.jpg', 2, 1, 4),

-- Maderas del Paraná (Rodrigo - id_usuario=5)
('Portarretratos de madera de lapacho',
 'Portarretratos artesanal tallado en madera de lapacho, tamaño 15x20cm.',
 18, 1800.00, 'portarretratos_lapacho.jpg', 5, 1, 5),

('Mate de madera con bombilla',
 'Mate torneado artesanalmente en madera de quebracho, incluye bombilla de alpaca.',
 22, 3200.00, 'mate_madera.jpg',   1, 1, 5),

-- Tejidos Valentina (Valentina - id_usuario=6)
('Camisa bordada estilo correntino',
 'Camisa de algodón con bordados típicos correntinos, colores vibrantes. Talle M y L.',
 10, 5500.00, 'camisa_bordada.jpg', 4, 1, 6),

('Pañuelo de seda con guardas típicas',
 'Pañuelo de seda natural pintado a mano con guardas y motivos del litoral.',
 14, 2800.00, 'pañuelo_seda.jpg',  4, 1, 6);
GO

-- =============================================
-- FLUJO TRANSACCIONAL - PEDIDO 1
-- Cliente 1 (Ana) compra Bolso + Dulce de mamón
-- =============================================

-- Carrito
INSERT INTO Carrito (fecha_creacion, subTotal, id_cliente)
VALUES ('2026-05-10 10:30:00', 5050.00, 1);
GO

-- Items del carrito (id_carrito=1)
INSERT INTO ItemCarrito (cantidad, precio, id_producto, id_carrito) VALUES
(1, 4200.00, 1, 1),  -- Bolso camalote
(1,  850.00, 3, 1);  -- Dulce de mamón
GO

-- Envío
INSERT INTO Envio (fecha_envio, fecha_entrega, id_estado_envio, id_tipo_envio)
VALUES ('2026-05-11 09:00:00', '2026-05-14 15:00:00', 3, 2);  -- Entregado, estándar
GO

-- Pedido (id_envio=1, id_cliente=1, id_direccion=1)
INSERT INTO Pedido (fecha_pedido, id_estadoPedido, id_envio, id_cliente, id_direccion)
VALUES ('2026-05-10 10:45:00', 2, 1, 1, 1);  -- Pagado
GO

-- Factura (id_pedido=1)
INSERT INTO Factura (fecha, total, id_pedido)
VALUES ('2026-05-10 10:45:00', 5900.00, 1);  -- total incluye envío
GO

-- Detalle factura (id_factura=1)
INSERT INTO DetalleFactura (cantidad, precio_unitario, id_factura, id_producto, id_carrito) VALUES
(1, 4200.00, 1, 1, 1),
(1,  850.00, 1, 3, 1);
GO

-- Pago (id_factura=1) - Aprobado -> dispara trigger de stock
INSERT INTO Pago (fecha, montoTotal, id_factura, id_formaPago, id_estadoPago)
VALUES ('2026-05-10 10:46:00', 5900.00, 1, 2, 2);  -- Transferencia, Aprobado
GO

-- =============================================
-- FLUJO TRANSACCIONAL - PEDIDO 2
-- Cliente 2 (Carlos) compra Aretes + Collar
-- =============================================
INSERT INTO Carrito (fecha_creacion, subTotal, id_cliente)
VALUES ('2026-05-15 14:00:00', 3700.00, 2);
GO

INSERT INTO ItemCarrito (cantidad, precio, id_producto, id_carrito) VALUES
(1, 1200.00, 6, 2),  -- Aretes
(1, 2500.00, 7, 2);  -- Collar
GO

INSERT INTO Envio (fecha_envio, fecha_entrega, id_estado_envio, id_tipo_envio)
VALUES ('2026-05-16 08:00:00', '2026-05-17 12:00:00', 3, 3);  -- Entregado, express
GO

INSERT INTO Pedido (fecha_pedido, id_estadoPedido, id_envio, id_cliente, id_direccion)
VALUES ('2026-05-15 14:10:00', 2, 2, 2, 4);  -- Pagado
GO

INSERT INTO Factura (fecha, total, id_pedido)
VALUES ('2026-05-15 14:10:00', 5200.00, 2);
GO

INSERT INTO DetalleFactura (cantidad, precio_unitario, id_factura, id_producto, id_carrito) VALUES
(1, 1200.00, 2, 6, 2),
(1, 2500.00, 2, 7, 2);
GO

INSERT INTO Pago (fecha, montoTotal, id_factura, id_formaPago, id_estadoPago)
VALUES ('2026-05-15 14:11:00', 5200.00, 2, 3, 2);  -- Tarjeta, Aprobado
GO

-- =============================================
-- FLUJO TRANSACCIONAL - PEDIDO 3
-- Cliente 3 (Lucía) compra Camisa bordada
-- =============================================
INSERT INTO Carrito (fecha_creacion, subTotal, id_cliente)
VALUES ('2026-05-20 09:15:00', 5500.00, 3);
GO

INSERT INTO ItemCarrito (cantidad, precio, id_producto, id_carrito)
VALUES (1, 5500.00, 10, 3);  -- Camisa bordada
GO

INSERT INTO Envio (fecha_envio, fecha_entrega, id_estado_envio, id_tipo_envio)
VALUES ('2026-05-21 10:00:00', '2026-05-24 16:00:00', 3, 2);  -- Entregado, estándar
GO

INSERT INTO Pedido (fecha_pedido, id_estadoPedido, id_envio, id_cliente, id_direccion)
VALUES ('2026-05-20 09:20:00', 2, 3, 3, 2);  -- Pagado
GO

INSERT INTO Factura (fecha, total, id_pedido)
VALUES ('2026-05-20 09:20:00', 6350.00, 3);
GO

INSERT INTO DetalleFactura (cantidad, precio_unitario, id_factura, id_producto, id_carrito)
VALUES (1, 5500.00, 3, 10, 3);
GO

INSERT INTO Pago (fecha, montoTotal, id_factura, id_formaPago, id_estadoPago)
VALUES ('2026-05-20 09:21:00', 6350.00, 3, 1, 2);  -- Efectivo, Aprobado
GO

-- =============================================
-- FLUJO TRANSACCIONAL - PEDIDO 4
-- Cliente 4 (Pablo) compra Mate de madera
-- Estado: Pendiente de pago (sin pago aún)
-- =============================================
INSERT INTO Carrito (fecha_creacion, subTotal, id_cliente)
VALUES ('2026-06-01 18:00:00', 3200.00, 4);
GO

INSERT INTO ItemCarrito (cantidad, precio, id_producto, id_carrito)
VALUES (1, 3200.00, 9, 4);  -- Mate de madera
GO

INSERT INTO Envio (fecha_envio, fecha_entrega, id_estado_envio, id_tipo_envio)
VALUES ('2026-06-02 08:00:00', NULL, 1, 2);  -- En Preparacion
GO

INSERT INTO Pedido (fecha_pedido, id_estadoPedido, id_envio, id_cliente, id_direccion)
VALUES ('2026-06-01 18:05:00', 1, 4, 4, 6);  -- Pendiente de Pago
GO

-- =============================================
-- VALORACIONES (sobre pedidos entregados)
-- =============================================
-- Cliente 1 valora Bolso (factura 1, producto 1)
INSERT INTO Valoración (puntaje, comentario, fecha, id_cliente, id_factura, id_producto)
VALUES (5, 'Hermoso bolso, muy bien terminado y el envío llegó antes de lo esperado. Lo recomiendo!',
        '2026-05-15 10:00:00', 1, 1, 1);
GO

-- Cliente 1 valora Dulce de mamón (factura 1, producto 3)
INSERT INTO Valoración (puntaje, comentario, fecha, id_cliente, id_factura, id_producto)
VALUES (4, 'Muy rico, aunque el frasco llegó con la tapa un poco floja. El sabor es excelente.',
        '2026-05-15 10:05:00', 1, 1, 3);
GO

-- Cliente 2 valora Aretes (factura 2, producto 6)
INSERT INTO Valoración (puntaje, comentario, fecha, id_cliente, id_factura, id_producto)
VALUES (5, 'Unos aretes preciosos, livianos y con mucho detalle. Feliz con la compra.',
        '2026-05-18 16:30:00', 2, 2, 6);
GO

-- Cliente 3 valora Camisa (factura 3, producto 10)
INSERT INTO Valoración (puntaje, comentario, fecha, id_cliente, id_factura, id_producto)
VALUES (5, 'La camisa es hermosa, el bordado es increíble. Calidad altísima para el precio.',
        '2026-05-25 11:00:00', 3, 3, 10);
GO

-- =============================================
-- RECLAMO
-- Cliente 1 reclama por el dulce con tapa floja
-- (factura 1, estado Entregado ok para habilitar reclamo)
-- =============================================
INSERT INTO Reclamo (fecha_reclamo, motivo, id_estadoReclamo, id_factura, id_cliente)
VALUES ('2026-05-15 10:10:00',
        'El frasco del dulce llegó con la tapa mal cerrada, se derramó un poco del contenido.',
        1,  -- Pendiente
        1, 1);
GO

-- Mensaje inicial del reclamo (id_reclamo=1, id_usuario NULL = cliente)
INSERT INTO Mensaje_Reclamo (contenido, fecha_emision_mensaje, id_reclamo, id_usuario)
VALUES ('Hola, quería informar que el frasco llegó con la tapa suelta. Pueden resolver esto?',
        '2026-05-15 10:10:00', 1, NULL);
GO

-- Respuesta del emprendedor (id_usuario=3 = Marcos, Sabores del Litoral)
INSERT INTO Mensaje_Reclamo (contenido, fecha_emision_mensaje, id_reclamo, id_usuario)
VALUES ('Hola Ana, disculpá el inconveniente. Te enviamos un reemplazo sin costo. Saludos!',
        '2026-05-15 15:30:00', 1, 3);
GO