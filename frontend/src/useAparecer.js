import { useEffect } from 'react';

/**
 * @fileoverview Hace aparecer los elementos a medida que entran en pantalla.
 *
 * Uso: ponerle `className="tr-aparece"` a lo que tiene que aparecer y llamar
 * a `useAparecer()` en el componente de la pantalla. Para escalonar varios
 * elementos seguidos, sumarles `style={{ '--i': 0 }}`, `'--i': 1`, etc.
 * La animación en sí está en animaciones.css.
 *
 * @param {Array} dependencias - Valores que, al cambiar, agregan elementos
 *   nuevos a la pantalla (por ejemplo, los productos cuando terminan de cargar).
 */
export default function useAparecer(dependencias = []) {
  useEffect(() => {
    const pendientes = document.querySelectorAll('.tr-aparece:not(.tr-visible)');
    if (pendientes.length === 0) return undefined;

    // Navegadores viejos: se muestra todo de una, sin animación.
    if (!('IntersectionObserver' in window)) {
      pendientes.forEach(el => el.classList.add('tr-visible'));
      return undefined;
    }

    const observador = new IntersectionObserver(
      entradas => {
        entradas.forEach(entrada => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add('tr-visible');
          observador.unobserve(entrada.target); // aparece una sola vez
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    pendientes.forEach(el => observador.observe(el));
    return () => observador.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencias);
}
