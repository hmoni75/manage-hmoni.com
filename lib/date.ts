const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Format any date input (timestamp integer, ISO string, YYYY-MM-DD string) into 'dd/mm/yy' format (e.g. 20/08/26).
 */
export function formatDate(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === '') return '-';

    let d: Date;

    if (typeof val === 'number') {
        // If seconds timestamp (e.g. 10 digits around 1.7e9), convert to ms
        const ms = val < 10000000000 ? val * 1000 : val;
        d = new Date(ms);
    } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return '-';

        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
            d = new Date(`${trimmed.substring(0, 10)}T00:00:00`);
        } else if (/^\d+$/.test(trimmed)) {
            const num = Number(trimmed);
            const ms = num < 10000000000 ? num * 1000 : num;
            d = new Date(ms);
        } else {
            d = new Date(trimmed);
        }
    } else {
        d = new Date(val);
    }

    if (isNaN(d.getTime())) {
        return String(val);
    }

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);

    return `${day}/${month}/${year}`;
}

/**
 * Convert any date input (HTML date picker 'YYYY-MM-DD', Date object, string) to Unix timestamp code in seconds (e.g. 1787210341).
 */
export function toTimestamp(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';

    if (typeof val === 'number') {
        return val < 10000000000 ? String(Math.floor(val)) : String(Math.floor(val / 1000));
    }

    const trimmed = String(val).trim();
    if (!trimmed) return '';

    if (/^\d+$/.test(trimmed)) {
        const num = Number(trimmed);
        return num < 10000000000 ? String(num) : String(Math.floor(num / 1000));
    }

    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return trimmed;

    return String(Math.floor(d.getTime() / 1000));
}

/**
 * Convert date value or timestamp to 'YYYY-MM-DD' for binding to HTML <input type="date">
 */
/**
 * Convert date value or timestamp to 'YYYY-MM-DD' for binding to HTML <input type="date"> or comparison
 */
export function toInputDateString(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';

    if (typeof val === 'number') {
        const ms = val < 10000000000 ? val * 1000 : val;
        const d = new Date(ms);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const trimmed = String(val).trim();
    if (!trimmed) return '';

    // Direct ISO string pattern: YYYY-MM-DD...
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
        return trimmed.substring(0, 10);
    }

    // Slash or dash format DD/MM/YYYY or DD-MM-YYYY
    if (/^\d{1,2}[-/]\d{1,2}[-/]\d{4}/.test(trimmed)) {
        const parts = trimmed.split(/[-/]/);
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }

    // Unix timestamp string: e.g. "1787210341"
    if (/^\d+$/.test(trimmed)) {
        const num = Number(trimmed);
        const ms = num < 10000000000 ? num * 1000 : num;
        const d = new Date(ms);
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const d = new Date(trimmed);
    if (isNaN(d.getTime())) return '';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Checks if a given date string/timestamp `dateVal` falls within `fromDate` (YYYY-MM-DD) and `toDate` (YYYY-MM-DD).
 */
export function isDateInRange(dateVal: string | number | null | undefined, fromDate?: string, toDate?: string): boolean {
    if (!fromDate && !toDate) return true;
    const dateStr = toInputDateString(dateVal);
    if (!dateStr) return false;

    if (fromDate && dateStr < fromDate) return false;
    if (toDate && dateStr > toDate) return false;

    return true;
}

const FULL_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/**
 * Derive Month Name string (e.g. 'August-2026') from date value or timestamp
 */
export function toMonthName(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === '') return '';

    let d: Date;
    if (typeof val === 'number') {
        const ms = val < 10000000000 ? val * 1000 : val;
        d = new Date(ms);
    } else if (typeof val === 'string') {
        const trimmed = val.trim();
        if (!trimmed) return '';
        if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
            d = new Date(trimmed.substring(0, 10));
        } else if (/^\d+$/.test(trimmed)) {
            const num = Number(trimmed);
            const ms = num < 10000000000 ? num * 1000 : num;
            d = new Date(ms);
        } else {
            d = new Date(trimmed);
        }
    } else {
        d = new Date(val);
    }

    if (isNaN(d.getTime())) return '';

    const month = FULL_MONTHS[d.getMonth()];
    const year = d.getFullYear();

    return `${month}-${year}`;
}

/**
 * Safely parse date value or timestamp to milliseconds Unix epoch number
 */
export function parseDateMs(val: string | number | null | undefined): number | null {
    if (val === null || val === undefined || val === '') return null;
    const dateStr = toInputDateString(val);
    if (!dateStr) return null;
    const d = new Date(`${dateStr}T00:00:00`);
    return isNaN(d.getTime()) ? null : d.getTime();
}


