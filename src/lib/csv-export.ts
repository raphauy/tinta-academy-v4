function escapeCsvField(field: string): string {
  if (
    field.includes(',') ||
    field.includes('"') ||
    field.includes('\n') ||
    field.includes('\r')
  ) {
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

export function generateCsv(headers: string[], rows: string[][]): string {
  const bom = '\uFEFF'
  const headerLine = headers.map(escapeCsvField).join(',')
  const dataLines = rows
    .map((row) => row.map(escapeCsvField).join(','))
    .join('\r\n')
  return `${bom}${headerLine}\r\n${dataLines}\r\n`
}
