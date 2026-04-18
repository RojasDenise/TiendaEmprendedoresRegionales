import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCategories, createProduct } from '../../services/productoService';

const ID_USUARIO_LOGUEADO = 1;

const formInicial = { 
    nombre: '', 
    descripcion: '', 
    precio: '', 
    stock: '', 
    id_categoria: '' 
};

export default function AgregarProducto() {
    const [form, setForm] = useState(formInicial);
    const [categorias, setCategorias] = useState([]);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [cargando, setCargando] = useState(false);
    const navigate = useNavigate();

    // 1. CARGA DE CATEGORÍAS AL INICIAR
    useEffect(() => {
        console.log("Cargando categorías...");
        getCategories()
            .then(data => {
                console.log("Categorías recibidas en el componente:", data);
                setCategorias(data);
            })
            .catch(e => {
                console.error("Error al obtener categorías:", e);
                mostrarMensaje("No se pudieron cargar las categorías: " + e.message, 'error');
            });
    }, []);

    const mostrarMensaje = (texto, tipo = 'success') => {
        setMensaje({ texto, tipo });
        setTimeout(() => setMensaje({ texto: '', tipo: '' }), 3000);
    };

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            await createProduct(
                form.nombre,
                form.descripcion,
                parseFloat(form.precio),
                parseInt(form.stock),
                parseInt(form.id_categoria),
                ID_USUARIO_LOGUEADO
            );
            mostrarMensaje('Producto agregado con éxito');
            setTimeout(() => navigate('/dashboard/productos'), 1500);
        } catch (e) {
            mostrarMensaje(e.message, 'error');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div>
            <div style={s.header}>
                <h1 style={s.titulo}>Agregar Producto</h1>
            </div>

            {mensaje.texto && <Alerta mensaje={mensaje} />}

            <div style={s.card}>
                <form onSubmit={handleSubmit}>
                    <div style={s.campo}>
                        <label style={s.label}>Nombre del Producto *</label>
                        <input name="nombre" value={form.nombre} onChange={handleChange}
                            maxLength={50} required style={s.input} placeholder="Ej: Mermelada de durazno" />
                    </div>
                    <div style={s.campo}>
                        <label style={s.label}>Descripción *</label>
                        <textarea name="descripcion" value={form.descripcion} onChange={handleChange}
                            required rows={3} style={{ ...s.input, resize: 'vertical' }}
                            placeholder="Describí tu producto..." />
                    </div>
                    <div style={s.grid2}>
                        <div style={s.campo}>
                            <label style={s.label}>Precio *</label>
                            <input name="precio" type="number" min="0.01" step="0.01"
                                value={form.precio} onChange={handleChange} required
                                style={s.input} placeholder="0.00" />
                        </div>
                        <div style={s.campo}>
                            <label style={s.label}>Stock *</label>
                            <input name="stock" type="number" min="0"
                                value={form.stock} onChange={handleChange} required
                                style={s.input} placeholder="0" />
                        </div>
                    </div>
                    <div style={s.campo}>
                        <label style={s.label}>Categoría *</label>
                        <select name="id_categoria" value={form.id_categoria}
                            onChange={handleChange} required style={s.input}>
                            <option value="">Seleccioná una categoría</option>
                            {categorias.length > 0 ? (
                                categorias.map(c => (
                                    <option key={c.id_categoria} value={c.id_categoria}>
                                        {c.descripcion}
                                    </option>
                                ))
                            ) : (
                                <option disabled>Cargando categorías...</option>
                            )}
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                        <button type="submit" disabled={cargando} style={s.btnGuardar}>
                            {cargando ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" onClick={() => navigate('/dashboard/productos')} style={s.btnCancelar}>
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// COMPONENTES AUXILIARES
function Alerta({ mensaje }) {
    return (
        <div style={{
            padding: '0.75rem 1rem', marginBottom: '1rem', borderRadius: 6,
            backgroundColor: mensaje.tipo === 'error' ? '#fde8e8' : '#e8f5e9',
            color: mensaje.tipo === 'error' ? '#c0392b' : '#27ae60',
            border: `1px solid ${mensaje.tipo === 'error' ? '#e74c3c' : '#2ecc71'}`
        }}>{mensaje.texto}</div>
    );
}

// ESTILOS
const s = {
    header: { marginBottom: '1.5rem' },
    titulo: { margin: 0, fontSize: '1.5rem', fontWeight: 'bold', color: '#2c3e50' },
    card: { backgroundColor: 'white', borderRadius: 8, padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxWidth: 600 },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    campo: { display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1rem' },
    label: { fontWeight: '500', fontSize: '0.95rem', color: '#333' },
    input: { padding: '0.6rem 0.75rem', borderRadius: 6, border: '1px solid #ddd', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' },
    btnGuardar: { padding: '0.6rem 1.5rem', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 'bold' },
    btnCancelar: { padding: '0.6rem 1.2rem', backgroundColor: 'white', color: '#333', border: '1px solid #ddd', borderRadius: 6, cursor: 'pointer' },
};