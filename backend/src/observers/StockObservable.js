class StockObservable {

    constructor() {
        this.observadores = [];
    }

    agregarObservador(observador) {
        this.observadores.push(observador);
    }

    eliminarObservador(observador) {

        this.observadores =
            this.observadores.filter(
                obs => obs !== observador
            );

    }

    notificarObservadores(producto, mensaje) {

        this.observadores.forEach(observador => {

            observador.actualizar(
                producto,
                mensaje
            );

        });

    }

}

module.exports = StockObservable;