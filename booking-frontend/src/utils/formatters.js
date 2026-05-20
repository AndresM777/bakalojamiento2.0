/**
 * Formatea un número como moneda COP (pesos colombianos).
 */
export function formatCurrency(amount) {
  if (amount == null) return '$0';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formatea una fecha ISO string a formato legible.
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(dateString));
}

/**
 * Formatea una fecha ISO string con hora.
 */
export function formatDateTime(dateString) {
  if (!dateString) return '—';
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

/**
 * Formatea fecha para inputs type="date" (YYYY-MM-DD).
 */
export function formatDateInput(dateString) {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
}

/**
 * Calcula la diferencia en noches entre dos fechas.
 */
export function calcularNoches(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const inicio = new Date(checkIn);
  const fin = new Date(checkOut);
  const diff = fin.getTime() - inicio.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

/**
 * Trunca un texto a un máximo de caracteres.
 */
export function truncate(text, maxLength = 100) {
  if (!text) return '';
  return text.length > maxLength
    ? text.substring(0, maxLength) + '…'
    : text;
}
