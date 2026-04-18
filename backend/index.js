const express = require('express');
const cors = require('cors');
const { getConnection } = require('./src/config/db'); // Importamos la conexión

const app = express();
app.use(cors());
app.use(express.json());

// Probamos la conexión al iniciar
getConnection();

app.get('/', (req, res) => {
    res.send('Servidor de la Tienda de Emprendedores funcionando');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});