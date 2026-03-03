export interface ReportHistoryItem {
    id: string; // timestamp normally
    fileName: string;
    userName: string;
    uploadDate: string; // ISO string or formatted
    uploadedData: any; // The stats, timeSeries, distributions
    fullTableData: any[][]; // The parsed table rows
    workbookBinary?: string; // Optional if we want to re-parse (usually we just need the table)
    selectedSheet: string;
}

const DB_NAME = 'LongWayDB';
const DB_VERSION = 1;
const STORE_NAME = 'reportsHistory';

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event: any) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

export async function saveReportHistory(report: ReportHistoryItem): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(report);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getAllReports(): Promise<ReportHistoryItem[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            // Sort by uploadDate descending
            const results = request.result || [];
            results.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
            resolve(results);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function getReportById(id: string): Promise<ReportHistoryItem | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function deleteReport(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
