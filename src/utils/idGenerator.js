export function generateId(prefix, existingIds) {
  let max = 0
  existingIds.forEach((id) => {
    const num = parseInt(String(id).split('-')[1], 10)
    if (!Number.isNaN(num) && num > max) max = num
  })
  const next = String(max + 1).padStart(3, '0')
  return `${prefix}-${next}`
}
