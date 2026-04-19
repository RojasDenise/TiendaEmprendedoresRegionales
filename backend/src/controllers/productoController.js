const productoService = require('../services/productoService');

const getProducts = async (req, res) => {
  try {
    const { id_usuario } = req.query;
    const productos = await productoService.getProducts(id_usuario);
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};

const getDeletedProducts = async (req, res) => {
  try {
    const { id_usuario } = req.query;
    const productos = await productoService.getDeletedProducts(id_usuario);
    res.json(productos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener productos eliminados' });
  }
};

const getProductById = async (req, res) => {
  try {
    const producto = await productoService.getProductById(req.params.id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(producto);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};

const createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, id_categoria, id_usuario } = req.body;
    const imagen = req.file ? req.file.filename : null;

    if (!nombre || !descripcion || !precio || !stock || !id_categoria || !id_usuario) {
      return res.status(400).json({ message: 'Complete todos los campos' });
    }
    if (precio <= 0 || stock < 0) {
      return res.status(400).json({ message: 'Precio y stock deben ser valores positivos' });
    }

    const nuevo = await productoService.createProduct({ nombre, descripcion, precio, stock, id_categoria, id_usuario, imagen });
    res.status(201).json({ message: 'Producto agregado con éxito', producto: nuevo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear producto' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, id_categoria } = req.body;
    const imagen = req.file ? req.file.filename : undefined;

    if (!nombre || !descripcion || !precio || stock === undefined || !id_categoria) {
      return res.status(400).json({ message: 'Complete todos los campos' });
    }
    if (precio <= 0 || stock < 0) {
      return res.status(400).json({ message: 'Precio y stock deben ser valores positivos' });
    }

    const actualizado = await productoService.updateProduct(req.params.id, { nombre, descripcion, precio, stock, id_categoria, imagen });
    if (!actualizado) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar producto' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const eliminado = await productoService.deleteProduct(req.params.id);
    if (!eliminado) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar producto' });
  }
};

const restoreProduct = async (req, res) => {
  try {
    const restaurado = await productoService.restoreProduct(req.params.id);
    if (!restaurado) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json({ message: 'Producto restaurado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al restaurar producto' });
  }
};

module.exports = { getProducts, getDeletedProducts, getProductById, createProduct, updateProduct, deleteProduct, restoreProduct };