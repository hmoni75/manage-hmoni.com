/**
 * Export data array to UTF-8 BOM encoded CSV file (opens perfectly in Excel with full Bengali/Unicode support).
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number | undefined | null)[][]) {
    if (typeof window === 'undefined') return;

    const processRow = (row: (string | number | undefined | null)[]) => {
        return row
            .map((val) => {
                const str = val === null || val === undefined ? '' : String(val);
                const escaped = str.replace(/"/g, '""');
                return `"${escaped}"`;
            })
            .join(',');
    };

    const csvContent = '\uFEFF' + [headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','), ...rows.map(processRow)].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

