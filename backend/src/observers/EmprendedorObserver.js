const ObservadorStock = require("./ObservadorStock");

class EmprendedorObserver extends ObservadorStock {

    actualizar(producto, mensaje) {

        console.log("=================================");
        console.log("ALERTA DE STOCK");
        console.log("Producto:", producto.nombre);
        console.log("Mensaje:", mensaje);
        console.log("=================================");

    }

}

module.exports = EmprendedorObserver;