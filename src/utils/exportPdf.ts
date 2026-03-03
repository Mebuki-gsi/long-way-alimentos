import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const loadLogoBase64 = async (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#D32F2F'; // Red background for the white logo
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.9));
            } else {
                reject('No canvas context');
            }
        };
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};

export const exportToPDF = async (data: any[], filename: string, title: string = 'Relatório') => {
    if (data.length === 0) return;

    const doc = new jsPDF('landscape');
    let logoDataUrl: string | null = null;

    try {
        // Try to load the SVG logo used in the Header
        const logoUrl = 'https://longwayalimentos.com.br/wp-content/uploads/2024/10/logo-branco-longway-1.svg';
        logoDataUrl = await loadLogoBase64(logoUrl);
    } catch (e) {
        console.warn('Could not load remote logo for PDF, using text fallback.', e);
    }

    const addHeader = (doc: jsPDF) => {
        if (logoDataUrl) {
            // Add the logo image and scale it
            doc.addImage(logoDataUrl, 'JPEG', 14, 10, 40, 15);
        } else {
            // Add text header as fallback
            doc.setFontSize(18);
            doc.setTextColor(211, 47, 47); // LongWay Red
            doc.text('LONG WAY ALIMENTOS', 14, 18);
        }

        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text(title, 14, 32);

        doc.setFontSize(10);
        doc.text(`Data de Geração: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 38);
    };

    addHeader(doc);

    // Extract headers
    const headers = data[0].map(String);
    // Extract rows
    const rows = data.slice(1).map(row => row.map((cell: any) => {
        if (cell === null || cell === undefined) return '';
        return String(cell);
    }));

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 45,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [220, 38, 38], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 45 },
    });

    doc.save(`${filename}.pdf`);
};
