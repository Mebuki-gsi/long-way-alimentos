import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string, sheetName: string = 'Sheet1') => {
    // Criar uma nova worksheet baseada nos dados (array de objetos)
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Criar um novo workbook e anexar a worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Escrever o arquivo (aciona o download no browser)
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};
