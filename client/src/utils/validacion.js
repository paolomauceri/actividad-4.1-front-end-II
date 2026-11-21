// Reglas de validación del lado del cliente (espejo de las del servidor).

export const MENSAJES = {
  requerido: 'Este campo es obligatorio',
  email: 'Ingresa un correo electrónico válido',
  password: 'Usa al menos 8 caracteres, con letras y números',
  nombre: 'Debe tener entre 2 y 60 caracteres',
  documento: 'Entre 5 y 20 caracteres: letras, números, puntos o guiones',
  fecha: 'La edad debe estar entre 5 y 100 años',
  sexo: 'Selecciona una opción',
  telefono: 'Solo números, espacios y + ( ) -',
  confirmar: 'Las contraseñas no coinciden',
};

export const esEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const esPasswordValida = (v) => /^(?=.*[A-Za-z])(?=.*\d).{8,72}$/.test(v);

export function edadEn(fechaIso, hoy = new Date()) {
  const [y, m, d] = fechaIso.split('-').map(Number);
  let edad = hoy.getFullYear() - y;
  if (hoy.getMonth() + 1 < m || (hoy.getMonth() + 1 === m && hoy.getDate() < d)) edad -= 1;
  return edad;
}

/** Valida el formulario de registro. Devuelve { campo: mensaje } solo con errores. */
export function validarRegistro(d) {
  const e = {};
  const largo = (v, min, max) => v.trim().length >= min && v.trim().length <= max;

  if (!d.nombre.trim()) e.nombre = MENSAJES.requerido;
  else if (!largo(d.nombre, 2, 60)) e.nombre = MENSAJES.nombre;

  if (!d.apellido.trim()) e.apellido = MENSAJES.requerido;
  else if (!largo(d.apellido, 2, 60)) e.apellido = MENSAJES.nombre;

  if (!d.email.trim()) e.email = MENSAJES.requerido;
  else if (!esEmail(d.email)) e.email = MENSAJES.email;

  if (!d.password) e.password = MENSAJES.requerido;
  else if (!esPasswordValida(d.password)) e.password = MENSAJES.password;

  if (!d.confirmar) e.confirmar = MENSAJES.requerido;
  else if (d.confirmar !== d.password) e.confirmar = MENSAJES.confirmar;

  if (!d.documento.trim()) e.documento = MENSAJES.requerido;
  else if (!/^[A-Za-z0-9.-]{5,20}$/.test(d.documento.trim())) e.documento = MENSAJES.documento;

  if (!d.fechaNacimiento) e.fechaNacimiento = MENSAJES.requerido;
  else {
    const edad = edadEn(d.fechaNacimiento);
    if (Number.isNaN(edad) || edad < 5 || edad > 100) e.fechaNacimiento = MENSAJES.fecha;
  }

  if (!d.sexo) e.sexo = MENSAJES.sexo;

  if (d.telefono && !/^[0-9+()\-\s]{1,20}$/.test(d.telefono)) e.telefono = MENSAJES.telefono;

  return e;
}
