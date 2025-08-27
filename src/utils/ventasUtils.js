export function formatDate(value) {
  const d = new Date(value);
  return isNaN(d) ? '—' : d.toLocaleDateString('es-CO');
}

export function toNumber(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

export function formatMoney(n) {
  return toNumber(n).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

export function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"');
}

export function toggleLoading($spinner, show) {
  if ($spinner) {
    $spinner.style.display = show ? 'block' : 'none';
  }
}
