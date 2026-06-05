class ObservadorStock {

    actualizar(producto, mensaje) {
        throw new Error("Debe implementar el método actualizar()");
    }

}

module.exports = ObservadorStock;