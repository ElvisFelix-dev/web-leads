export function formatArea(value) {
  if (!value) return '';

  const number = value.replace(/\D/g, '');

  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function areaToNumber(value) {
  if (!value) return 0;

  return Number(value.replace(/\./g, ''));
}
