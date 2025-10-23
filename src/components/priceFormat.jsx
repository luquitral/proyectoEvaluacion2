export function formatCLP(value) {
  const n = Math.round(Number(value) || 0)
  try {
    return new Intl.NumberFormat('es-CL').format(n)
  } catch {
    return String(n)
  }
}

export function formatCLPCurrency(value) {
  return `$ ${formatCLP(value)}`
}

export default formatCLP
