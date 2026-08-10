export function formatCurrency(value) {
  if (!value) return '';

  const numbers = value.replace(/\D/g, '');

  const amount = Number(numbers) / 100;

  return amount.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function currencyToNumber(value) {
  if (!value) return 0;

  return Number(value.replace(/\D/g, '')) / 100;
}
