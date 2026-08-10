export class ReportExporter {
  public static exportToCSV(filename: string, rows: Record<string, any>[]): void {
    if (!rows || rows.length === 0) return

    const headers = Object.keys(rows[0])
    const csvLines = [headers.join(',')]

    rows.forEach(row => {
      const values = headers.map(header => {
        const val = row[header]
        const escaped = ('' + val).replace(/"/g, '""')
        return `"${escaped}"`
      })
      csvLines.push(values.join(','))
    })

    const csvContent = 'data:text/csv;charset=utf-8,' + csvLines.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${filename}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  public static exportToPDF(reportTitle: string): void {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }
}
