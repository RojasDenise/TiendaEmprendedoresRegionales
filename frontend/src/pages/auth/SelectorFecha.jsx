import { useState } from 'react';
import { estiloSelect } from './authEstilos';

/**
 * @fileoverview Fecha de nacimiento con tres desplegables (día, mes, año).
 *
 * Reemplaza al calendario nativo del navegador, que cambia de aspecto en cada
 * navegador y obliga a retroceder año por año para llegar a una fecha de nacimiento.
 *
 * Devuelve la fecha completa como 'AAAA-MM-DD' (o '' mientras falte alguna parte),
 * el mismo formato que usaba el campo anterior.
 *
 * @module SelectorFecha
 */

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

/** Días que tiene un mes (mes 1-12). Sin año elegido se asume bisiesto, para no esconder el 29 de febrero. */
const diasDelMes = (mes, anio) => new Date(anio || 2000, mes, 0).getDate();

const dosDigitos = (n) => String(n).padStart(2, '0');

/** Separa 'AAAA-MM-DD' en sus partes (texto vacío si falta). */
const separar = (valor) => {
  const [anio = '', mes = '', dia = ''] = (valor || '').split('-');
  return { dia: dia ? String(Number(dia)) : '', mes: mes ? String(Number(mes)) : '', anio };
};

/**
 * @param {object}   props
 * @param {string}   props.id          - Prefijo de los id (para las etiquetas).
 * @param {string}   props.value       - Fecha 'AAAA-MM-DD' o ''.
 * @param {Function} props.onChange    - Recibe la fecha completa o '' si está incompleta.
 * @param {number}   [props.edadMinima=16]  - El año más reciente que se ofrece.
 * @param {number}   [props.edadMaxima=100] - El año más antiguo que se ofrece.
 */
export default function SelectorFecha({ id = 'fecha', value, onChange, edadMinima = 16, edadMaxima = 100 }) {
  const [partes, setPartes] = useState(() => separar(value));

  const anioActual = new Date().getFullYear();
  const anios = [];
  for (let a = anioActual - edadMinima; a >= anioActual - edadMaxima; a--) anios.push(a);

  const totalDias = partes.mes ? diasDelMes(Number(partes.mes), Number(partes.anio)) : 31;

  const cambiar = (campo, valor) => {
    const nuevas = { ...partes, [campo]: valor };
    // Si el día elegido no existe en el mes nuevo (ej. 31 de abril), se baja al último día.
    if (nuevas.dia && nuevas.mes) {
      const maximo = diasDelMes(Number(nuevas.mes), Number(nuevas.anio));
      if (Number(nuevas.dia) > maximo) nuevas.dia = String(maximo);
    }
    setPartes(nuevas);
    const completa = nuevas.dia && nuevas.mes && nuevas.anio;
    onChange(completa ? `${nuevas.anio}-${dosDigitos(nuevas.mes)}-${dosDigitos(nuevas.dia)}` : '');
  };

  return (
    <div style={s.fila} role="group" aria-labelledby={`${id}-etiqueta`}>
      <select id={`${id}-dia`} aria-label="Día" value={partes.dia} required
        onChange={e => cambiar('dia', e.target.value)}
        style={{ ...s.select, color: partes.dia ? '#111' : '#999' }}>
        <option value="" disabled>Día</option>
        {Array.from({ length: totalDias }, (_, i) => i + 1).map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select id={`${id}-mes`} aria-label="Mes" value={partes.mes} required
        onChange={e => cambiar('mes', e.target.value)}
        style={{ ...s.select, color: partes.mes ? '#111' : '#999' }}>
        <option value="" disabled>Mes</option>
        {MESES.map((nombre, i) => (
          <option key={nombre} value={i + 1}>{nombre}</option>
        ))}
      </select>

      <select id={`${id}-anio`} aria-label="Año" value={partes.anio} required
        onChange={e => cambiar('anio', e.target.value)}
        style={{ ...s.select, color: partes.anio ? '#111' : '#999' }}>
        <option value="" disabled>Año</option>
        {anios.map(a => (
          <option key={a} value={a}>{a}</option>
        ))}
      </select>
    </div>
  );
}

const s = {
  fila: { display: 'grid', gridTemplateColumns: 'minmax(0, 0.8fr) minmax(0, 1.5fr) minmax(0, 1fr)', gap: 8 },
  select: estiloSelect,
};
