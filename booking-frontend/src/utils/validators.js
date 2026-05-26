/**
 * Valida un email con regex profesional.
 */
export function isValidEmail(email) {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida que la contraseña tenga mínimo 8 caracteres.
 */
export function isValidPassword(password) {
  return password && password.length >= 8;
}

/**
 * Valida que un campo no esté vacío.
 */
export function isRequired(value) {
  if (typeof value === 'string') return value.trim().length > 0;
  return value != null;
}

/**
 * Valida una cédula colombiana (7-10 dígitos).
 */
export function isValidCedula(cedula) {
  if (!cedula) return false;
  return /^\d{7,10}$/.test(cedula);
}

/**
 * Valida un teléfono colombiano.
 */
export function isValidTelefono(telefono) {
  if (!telefono) return false;
  return /^\d{7,10}$/.test(telefono.replace(/[\s-]/g, ''));
}

/**
 * Valida que checkOut sea posterior a checkIn.
 */
export function isValidDateRange(checkIn, checkOut) {
  if (!checkIn || !checkOut) return false;
  return new Date(checkOut) > new Date(checkIn);
}

/**
 * Valida que una fecha no sea pasada.
 */
export function isFutureDate(date) {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(date) >= today;
}

/**
 * Ejecuta validaciones y retorna un objeto de errores.
 * @param {Object} rules - { campo: [{ validate: fn, message: string }] }
 * @param {Object} values - { campo: valor }
 * @returns {Object} errores - { campo: mensaje } (vacío si no hay errores)
 */
export function validateForm(rules, values) {
  const errors = {};

  for (const [field, fieldRules] of Object.entries(rules)) {
    for (const rule of fieldRules) {
      if (!rule.validate(values[field], values)) {
        errors[field] = rule.message;
        break; // Solo mostrar el primer error por campo
      }
    }
  }

  return errors;
}
