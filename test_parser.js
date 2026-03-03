import * as XLSX from 'xlsx';

const csvData = `DATE,"TIME","MILLISECOND","32-BIT FLOAT"
2025/11/27,"16:40:11","550","285.2000"
2025/11/27,"16:40:12","570","286.4000"`;

const wb = XLSX.read(csvData, { type: 'string' });
const sheet = wb.Sheets[wb.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

console.log("RawData:", rawData);
console.log("rawData[0].length:", rawData[0].length);

const isMashed = rawData.some(r => r.length === 1 && String(r[0]).includes(','));
console.log("isMashed:", isMashed);

let allData = rawData;
if (isMashed || rawData[0].length < 3) {
    const newHeaders = [
        'POSSIVEL TROCA', 'AMOSTRA', 'DATE', 'TIME', 'MILLISECOND',
        '32-BIT FLOAT', 'DIFF TEMPO', 'PESO (G)', 'DIFF PESO', 'PESO PADRÃO', 'DIFF'
    ];
    const explodedData = [newHeaders];
    let lastTimeStr = "";
    let lastWeight = 0;
    let amostraCounter = 1;

    for (let i = 1; i < rawData.length; i++) {
        const rowStr = String(rawData[i][0] || '');
        if (!rowStr) continue;
        let parts = rowStr.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        if (!parts || parts.length < 4) {
            parts = rowStr.split(',');
        }
        let cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim());
        cleanParts = cleanParts.filter(p => p !== "");
        if (cleanParts.length >= 4) {
            console.log("Matched!", cleanParts);
            explodedData.push(cleanParts);
        } else {
            console.log("Failed parts:", cleanParts);
        }
    }
    allData = explodedData;
}

console.log("AllData:", allData);
