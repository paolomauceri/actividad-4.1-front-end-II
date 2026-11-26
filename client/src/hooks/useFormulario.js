import { useState } from 'react';

/**
 * Estado común de los formularios: valores, errores por campo, error general
 * y envío. Los errores de validación de la API (details) se muestran junto a
 * cada campo; cualquier otro error, arriba del formulario.
 *
 * @param {{ inicial: object, validar?: (datos) => object, enviar: (datos) => Promise<void> }} opciones
 */
export function useFormulario({ inicial, validar = () => ({}), enviar }) {
  const [datos, setDatos] = useState(inicial);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [enviando, setEnviando] = useState(false);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setDatos((d) => ({ ...d, [name]: value }));
    if (errores[name]) setErrores((er) => ({ ...er, [name]: undefined }));
  };

  /** Props para un <Input>: name, value, onChange y error. */
  const campo = (name) => ({ name, value: datos[name] ?? '', onChange: cambiar, error: errores[name] });

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorGeneral('');
    const nuevos = validar(datos);
    setErrores(nuevos);
    if (Object.values(nuevos).some(Boolean)) return;

    setEnviando(true);
    try {
      await enviar(datos);
    } catch (err) {
      if (err?.details?.length) {
        setErrores(Object.fromEntries(err.details.map((d) => [d.campo, d.mensaje])));
      } else {
        setErrorGeneral(err?.message ?? 'No se pudo guardar. Intenta de nuevo.');
      }
    } finally {
      setEnviando(false);
    }
  };

  return { datos, setDatos, errores, errorGeneral, enviando, campo, onSubmit };
}
