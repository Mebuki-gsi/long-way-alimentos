
import { useState, ChangeEvent, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Legend
} from 'recharts';
import {
  TrendingUp, Users, Package, AlertTriangle, FileText, LayoutDashboard, LogOut, RefreshCw, Upload, Calendar, ChevronDown, ChevronLeft, ChevronRight, Trash2, Download, FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { saveReportHistory, getAllReports, getReportById, deleteReport, ReportHistoryItem } from '../utils/indexedDB';
import Tables from './Tables';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  // Data State
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [availableSheets, setAvailableSheets] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [uploadedData, setUploadedData] = useState<any>(null);

  // Filtering State
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);

  // History State
  const [reportsHistory, setReportsHistory] = useState<ReportHistoryItem[]>([]);
  const [viewingReportTable, setViewingReportTable] = useState(false);

  const [selectedDailyMonth, setSelectedDailyMonth] = useState<string>('');
  const [dailyAverages, setDailyAverages] = useState<{ day: string, value: number, month: string }[]>([]);

  // Table Pagination State
  const [fullTableData, setFullTableData] = useState<any[][]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  useEffect(() => {
    loadHistory();
  }, []);

  // Auto-repair for old reports missing daily averages
  useEffect(() => {
    if (uploadedData && !uploadedData.dailyAverages && fullTableData.length > 0) {
      const headers = (fullTableData[0] || []).map((h: any) => String(h).toLowerCase());
      const dateIdx = headers.findIndex((h: any) => h === 'date' || h === 'data' || h === 'dt' || (h.includes('date') || h.includes('data')) && !h.includes(','));
      const pesoIdx = headers.findIndex((h: any) => h === 'peso (g)' || h === '32-bit float' || (h.includes('peso') && !h.includes('padrão')));

      if (dateIdx !== -1 && pesoIdx !== -1) {
        const dailyMap: { [key: string]: { sum: number, count: number, month: string } } = {};
        fullTableData.slice(1).forEach((row: any) => {
          const d = parseExcelDate(row[dateIdx]);
          if (d) {
            const dStr = d.toISOString().split('T')[0];
            const mStr = dStr.substring(0, 7);
            const val = parseFloat(String(row[pesoIdx]).replace(/[^\d.-]/g, ''));
            if (!isNaN(val) && val > 0) {
              if (!dailyMap[dStr]) dailyMap[dStr] = { sum: 0, count: 0, month: mStr };
              dailyMap[dStr].sum += val;
              dailyMap[dStr].count += 1;
            }
          }
        });

        const dailyData = Object.keys(dailyMap).sort().map(date => ({
          day: date.split('-')[2],
          value: Number((dailyMap[date].sum / dailyMap[date].count).toFixed(2)),
          month: dailyMap[date].month,
          fullDate: date
        }));

        if (dailyData.length > 0) {
          setUploadedData({
            ...uploadedData,
            dailyAverages: dailyData
          });
          if (!selectedDailyMonth) {
            setSelectedDailyMonth(dailyData[dailyData.length - 1].month);
          }
        }
      }
    }
  }, [uploadedData, fullTableData]);

  const loadHistory = async () => {
    try {
      const history = await getAllReports();
      setReportsHistory(history);
    } catch (error) {
      console.error("Failed to load history", error);
    }
  };

  const handleLoadReport = async (id: string, forceNavigateToReports: boolean = false) => {
    try {
      const report = await getReportById(id);
      if (report) {
        setUploadedData(report.uploadedData);
        setFullTableData(report.fullTableData);
        setFileName(report.fileName);
        setCurrentReportId(report.id);
        setCurrentPage(1);

        if (forceNavigateToReports) {
          setViewingReportTable(true);
          setActiveTab('reports');
        }
      }
    } catch (e) {
      toast.error('Erro ao carregar relatório');
    }
  };

  const handleDeleteReport = async (id: string) => {
    toast((t) => (
      <div className="flex flex-col gap-3 p-1">
        <span className="text-sm font-semibold text-gray-800">Deseja excluir este relatório do Histórico?</span>
        <div className="flex gap-2 justify-end">
          <button
            className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700 text-xs font-bold transition-colors"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancelar
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-colors"
            onClick={async () => {
              toast.dismiss(t.id);
              await deleteReport(id);
              loadHistory();
              if (currentReportId === id) {
                setViewingReportTable(false);
                setUploadedData(null);
                setFullTableData([]);
                setFileName('');
              }
              toast.success('Relatório excluído do histórico!');
            }}
          >
            Sim, excluir
          </button>
        </div>
      </div>
    ), { duration: Infinity, id: 'delete-confirm' });
  };



  const stats = uploadedData?.stats;
  const timeSeries = uploadedData?.timeSeries;
  const distribution = uploadedData?.distribution;

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  // --- HELPER FUNCTIONS ---
  const excelToJSDate = (serial: any) => {
    if (typeof serial !== 'number') return null;
    return new Date(Math.round((serial - 25569) * 86400 * 1000));
  };

  const parseExcelDate = (val: any) => {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return excelToJSDate(val);
    if (typeof val === 'string') {
      const parts = val.split(/[/-]/);
      if (parts.length === 3) {
        if (parts[0].length === 4) return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (parts[2].length === 4) return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      }
      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  const generateDashboardPDF = () => {
    const originalTitle = document.title;
    document.title = fileName ? `Dashboard_${fileName.replace('.csv', '')}` : 'Dashboard_Visualizacao';
    window.print();
    setTimeout(() => { document.title = originalTitle; }, 1000);
  };

  const handlePossivelTrocaChange = async (actualIndex: number, newValue: string) => {
    const updatedData = [...fullTableData];
    updatedData[actualIndex][0] = newValue;
    setFullTableData(updatedData);

    if (currentReportId) {
      try {
        const report = await getReportById(currentReportId);
        if (report) {
          report.fullTableData = updatedData;
          await saveReportHistory(report);
          toast.success('Alteração salva!');
        }
      } catch (e) {
      }
    }
  };

  // Helper to format Excel values
  const formatCellValue = (value: any, colIdx: number, header: string = "") => {
    if (value === null || value === undefined || value === '') return '';

    const h = header.toLowerCase();

    // 1. Check for Dates/Times (Numeric or String)
    if (h.includes('date') || h.includes('data') || h.includes('time') || h.includes('hora')) {
      if (typeof value === 'number') {
        try {
          const date = XLSX.SSF.parse_date_code(value);
          const d = date.d < 10 ? `0${date.d}` : date.d;
          const m = date.m < 10 ? `0${date.m}` : date.m;

          if (h.includes('time') || h.includes('hora')) {
            const hh = date.H < 10 ? `0${date.H}` : date.H;
            const mm = date.M < 10 ? `0${date.M}` : date.M;
            const ss = date.S < 10 ? `0${date.S}` : date.S;
            return `${hh}:${mm}:${ss}`;
          }
          return `${d}/${m}/${date.y}`;
        } catch (e) {
          return value;
        }
      }

      if (typeof value === 'string') {
        const d = parseExcelDate(value);
        if (d) {
          const day = d.getDate().toString().padStart(2, '0');
          const month = (d.getMonth() + 1).toString().padStart(2, '0');
          const year = d.getFullYear();
          return `${day}/${month}/${year}`;
        }
      }
    }

    // 2. Check for Weights or General Numbers
    if (typeof value === 'number') {
      if (h.includes('peso') || h.includes('weight')) {
        return value.toFixed(2) + 'g';
      }
      return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    }

    // 3. Fallback
    return String(value);
  };

  const processSheetData = (sheetName: string, wb: XLSX.WorkBook, sDate?: string, eDate?: string) => {
    try {
      const sheet = wb.Sheets[sheetName];
      let rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      if (rawData.length < 2) return;

      let allData: any[][] = rawData;
      let standardWeight: number = 259; // Default GS standard weight fallback
      // ---- 1. Check if the CSV is mashed into Column A ----
      // Sometimes headers might be missing or commas aren't properly decoded.
      // If the sheet has raw string data with less than 2 valid columns detected, we force the parse.
      const isMashed = rawData.some(r => r.length === 1 && String(r[0]).includes(','));

      if (isMashed || rawData[0].length < 3) {
        // Expand mashed column A into proper columns
        const newHeaders = [
          'POSSIVEL TROCA', 'AMOSTRA', 'DATE', 'TIME', 'MILLISECOND',
          '32-BIT FLOAT', 'DIFF TEMPO', 'PESO (G)', 'DIFF PESO', 'PESO PADRÃO', 'DIFF'
        ];

        const explodedData: any[][] = [newHeaders];

        let lastTimeStr = "";
        let lastWeight = 0;
        let amostraCounter = 1;

        for (let i = 1; i < rawData.length; i++) {
          const rowStr = String(rawData[i][0] || '');
          if (!rowStr) continue;
          // Fallback splitting to handle standard commas or quoted properties.
          // Format expected: 2025/11/27,"16:40:11","550","285.2000"
          let parts = rowStr.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) as string[] | null;

          if (!parts || parts.length < 4) {
            // Second try: strict comma split
            parts = rowStr.split(',') as string[];
          }

          let cleanParts = parts.map(p => p.replace(/^"|"$/g, '').trim());

          // Clean empty or extra
          cleanParts = cleanParts.filter(p => p !== "");

          if (cleanParts.length >= 4) {
            const dateStr = cleanParts[0];
            const timeStr = cleanParts[1];
            const mili = cleanParts[2];
            let weightStr = cleanParts[3];

            // Clean weightStr (sometimes comes like "285.2000" or "285,2000")
            weightStr = weightStr.replace(/[^0-9.,]/g, '').replace(',', '.');

            const weightDec = parseFloat(weightStr);
            if (isNaN(weightDec) || weightDec <= 0) continue;

            let diffTempo = "";
            if (lastTimeStr) {
              const timeObj1 = new Date(`1970-01-01T${lastTimeStr}Z`);
              const timeObj2 = new Date(`1970-01-01T${timeStr}Z`);
              const diffSecs = Math.abs((timeObj2.getTime() - timeObj1.getTime()) / 1000);
              const h = Math.floor(diffSecs / 3600);
              const m = Math.floor((diffSecs % 3600) / 60);
              const s = Math.floor(diffSecs % 60);
              diffTempo = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            }

            const diffPeso = i === 1 ? "" : (weightDec - lastWeight).toFixed(2) + 'g';
            const diffRatio = ((weightDec / standardWeight) * 100).toFixed(2) + '%';

            explodedData.push([
              "", // POSSIVEL TROCA
              amostraCounter,
              dateStr,
              timeStr,
              mili,
              weightStr,
              diffTempo,
              weightDec.toFixed(2) + 'g',
              diffPeso,
              standardWeight.toFixed(2) + 'g',
              diffRatio
            ]);

            lastTimeStr = timeStr;
            lastWeight = weightDec;
            amostraCounter++;
          }
        }
        allData = explodedData;
      }

      const headers = (allData[0] || []).map(h => String(h).toLowerCase());

      // Look for the best date column
      const exactDateIdx = headers.findIndex(h => h === 'date' || h === 'data' || h === 'dt');
      const dateIdx = exactDateIdx !== -1 ? exactDateIdx : headers.findIndex(h => (h.includes('date') || h.includes('data')) && !h.includes(','));

      // Separate headers from data
      const dataRows = allData.slice(1);

      // Initial date range detection if not provided
      if (!sDate || !eDate) {
        let minD: Date | null = null;
        let maxD: Date | null = null;

        dataRows.forEach(row => {
          const d = parseExcelDate(row[dateIdx]);
          if (d) {
            if (!minD || d < minD) minD = d;
            if (!maxD || d > maxD) maxD = d;
          }
        });

        if (minD && maxD) {
          const minStr = minD.toISOString().split('T')[0];
          const maxStr = maxD.toISOString().split('T')[0];
          if (!sDate) setStartDate(minStr);
          if (!eDate) setEndDate(maxStr);
          sDate = sDate || minStr;
          eDate = eDate || maxStr;
        }
      }

      // Filter rows based on date
      const filteredRows = dataRows.filter(row => {
        const d = parseExcelDate(row[dateIdx]);
        if (d && sDate && eDate) {
          const dStr = d.toISOString().split('T')[0];
          return dStr >= sDate && dStr <= eDate;
        }
        return !sDate || !eDate;
      });

      setFullTableData([allData[0], ...filteredRows]);
      setCurrentPage(1);

      // Extract weights from filtered rows or exploded logic
      const weights: number[] = [];

      filteredRows.forEach(row => {
        const pesoIdx = headers.findIndex(h => h === 'peso (g)' || h === '32-bit float' || (h.includes('peso') && !h.includes('padrão')));
        if (pesoIdx !== -1) {
          const val = parseFloat(String(row[pesoIdx]).replace(/[^\d.-]/g, ''));
          if (!isNaN(val) && val > 0) weights.push(val);
        } else {
          // Fallback
          const col0 = String(row[0] || '');
          const parts = col0.match(/"([^"]*)"|([^,]+)/g);
          if (parts && parts.length >= 4) {
            const w = parseFloat(parts[3].replace(/"/g, ''));
            if (!isNaN(w)) weights.push(w);
          } else {
            row.forEach((cell, idx) => {
              const header = headers[idx] || '';
              const v = parseFloat(String(cell));
              if (!isNaN(v) && header.includes('peso') && !header.includes('padrão')) {
                weights.push(v);
              }
            });
          }
        }
      });

      const n = weights.length;
      if (n === 0) {
        setUploadedData({ stats: null, timeSeries: [], distribution: [] });
        return;
      }

      const sum = weights.reduce((a, b) => a + b, 0);
      const mean = sum / n;
      const sorted = [...weights].sort((a, b) => a - b);
      const min = sorted[0];
      const max = sorted[n - 1];
      const std = Math.sqrt(weights.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n);

      const rejection_count = weights.filter(w => w < standardWeight).length;
      const rejection_rate = (rejection_count / n) * 100;

      const newStats = {
        count: n,
        mean,
        std,
        min,
        max,
        median: sorted[Math.floor(n * 0.5)],
        q1: sorted[Math.floor(n * 0.25)],
        q3: sorted[Math.floor(n * 0.75)],
        rejection_count,
        rejection_rate,
        conformity_rate: ((n - rejection_count) / n) * 100,
        conformity_count: n - rejection_count,
        cv: (std / mean) * 100,
        range: max - min,
        standardWeight
      };

      // 1. FILTER VISUAL OUTLIERS for the Time Series (prevents Y-axis flattening)
      // We only filter for the GRAPH, not for the official stats (count, mean, etc.)
      const visualWeights = weights.filter(w => w >= standardWeight * 0.5 && w <= standardWeight * 2.0);

      // 2. Representative Sampling (Downsampling) with smoothing (max 300 points)
      const maxPoints = 300;
      let timeSeriesData = [];

      if (visualWeights.length <= maxPoints) {
        timeSeriesData = visualWeights.map((w, i) => ({ x: i + 1, y: Number(w.toFixed(2)) }));
      } else {
        const step = visualWeights.length / maxPoints;
        for (let i = 0; i < maxPoints; i++) {
          const start = Math.floor(i * step);
          const end = Math.floor((i + 1) * step);
          const chunk = visualWeights.slice(start, end);
          const chunkMean = chunk.reduce((a, b) => a + b, 0) / (chunk.length || 1);
          timeSeriesData.push({
            x: Math.floor(start + 1), // Use original index as reference
            y: Number(chunkMean.toFixed(2))
          });
        }
      }

      // --- STATISTICAL HISTOGRAM BINS ---
      // We focus on the "bulk" of the data (Mean +/- 3 StdDev) to avoid outliers ruining the chart
      const binCount = 12;
      const coreMin = Math.max(min, mean - 3 * std);
      const coreMax = Math.min(max, mean + 3 * std);
      const coreRange = coreMax - coreMin || 10;
      const binWidth = coreRange / binCount;

      const distribution: { label: string, value: number }[] = [];

      // 1. Below Core Bin
      const belowCount = weights.filter(w => w < coreMin).length;
      if (belowCount > 0) {
        distribution.push({ label: `<${coreMin.toFixed(0)}g`, value: belowCount });
      }

      // 2. Core Bins
      for (let i = 0; i < binCount; i++) {
        const bMin = coreMin + (i * binWidth);
        const bMax = coreMin + ((i + 1) * binWidth);
        const label = `${bMin.toFixed(0)}-${bMax.toFixed(0)}g`;
        const count = weights.filter(w => w >= bMin && w < bMax).length;
        distribution.push({ label, value: count });
      }

      // 3. Above Core Bin
      const aboveCount = weights.filter(w => w >= coreMax).length;
      if (aboveCount > 0) {
        distribution.push({ label: `>${coreMax.toFixed(0)}g`, value: aboveCount });
      }

      // --- DAILY AVERAGES CALCULATION ---
      const dailyMap: { [key: string]: { sum: number, count: number, month: string } } = {};
      filteredRows.forEach(row => {
        const d = parseExcelDate(row[dateIdx]);
        if (d) {
          const dStr = d.toISOString().split('T')[0]; // YYYY-MM-DD
          const mStr = dStr.substring(0, 7); // YYYY-MM
          const pesoIdx = headers.findIndex(h => h === 'peso (g)' || h === '32-bit float' || (h.includes('peso') && !h.includes('padrão')));
          if (pesoIdx !== -1) {
            const val = parseFloat(String(row[pesoIdx]).replace(/[^\d.-]/g, ''));
            if (!isNaN(val) && val > 0) {
              if (!dailyMap[dStr]) dailyMap[dStr] = { sum: 0, count: 0, month: mStr };
              dailyMap[dStr].sum += val;
              dailyMap[dStr].count += 1;
            }
          }
        }
      });

      const dailyData = Object.keys(dailyMap).sort().map(date => ({
        day: date.split('-')[2], // Just the DD
        value: Number((dailyMap[date].sum / dailyMap[date].count).toFixed(2)),
        month: dailyMap[date].month,
        fullDate: date
      }));

      // Auto-select the last month available if none selected
      if (!selectedDailyMonth && dailyData.length > 0) {
        setSelectedDailyMonth(dailyData[dailyData.length - 1].month);
      }

      const calculatedData = {
        stats: newStats,
        timeSeries: timeSeriesData,
        distribution,
        dailyAverages: dailyData
      };

      setUploadedData(calculatedData);

      // Return the generated data so it can be saved by the caller (handleFileUpload)
      return {
        fullTableData: [allData[0], ...filteredRows],
        uploadedData: calculatedData
      };

    } catch (err: any) {
      console.error(err);
      alert('Erro ao processar dados');
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      // Use setTimeout to ensure the loading state is rendered before heavy processing
      setTimeout(() => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          setWorkbook(wb);

          const validSheets = wb.SheetNames.filter(name => !name.toLowerCase().includes('teste'));
          setAvailableSheets(validSheets);

          const initialSheet = validSheets.find(n => n.toLowerCase() === 'base') || validSheets[0];
          setSelectedSheet(initialSheet);

          // Reset dates
          setStartDate('');
          setEndDate('');

          // 1. Process data returning fullTableData and uploadedData
          const sheet = wb.Sheets[initialSheet];

          const processedResult = processSheetData(initialSheet, wb);

          if (processedResult) {
            const newReportId = new Date().toISOString();
            const newFileName = file.name;

            setFileName(newFileName);
            setCurrentReportId(newReportId);

            saveReportHistory({
              id: newReportId,
              fileName: newFileName,
              userName: 'Admin', // future context
              uploadDate: new Date().toISOString(),
              uploadedData: processedResult.uploadedData,
              fullTableData: processedResult.fullTableData,
              selectedSheet: initialSheet
            }).then(() => {
              toast.success('Arquivo salvo no Histórico Local!');
              loadHistory(); // Atualizando os relatorios salvos localmente
            }).catch(e => {
              console.error("Falha ao salvar historico", e);
              toast.error('Erro ao guardar histórico');
            });
          }

        } catch (err: any) {
          alert(err.message || 'Erro ao carregar arquivo');
        } finally {
          setLoading(false);
        }
      }, 100);
    };
    reader.readAsBinaryString(file);
  };

  const onSheetChange = (sheetName: string) => {
    if (!workbook) return;
    setSelectedSheet(sheetName);
    processSheetData(sheetName, workbook, startDate, endDate);
  };

  const StatRow = ({ label, value, color = "text-gray-700" }: any) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-2">
      <span className="text-sm font-medium text-gray-500 uppercase tracking-tight">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{value}</span>
    </div>
  );

  const paginatedData = useMemo(() => {
    if (fullTableData.length === 0) return [];
    const startIndex = (currentPage - 1) * rowsPerPage;
    return fullTableData.slice(startIndex, startIndex + rowsPerPage);
  }, [fullTableData, currentPage]);

  const totalPages = Math.ceil(fullTableData.length / rowsPerPage);
  const tableHeaders = fullTableData[0] || [];

  return (
    <>
      <style>
        {`
          @media print {
            @page { size: landscape; margin: 0; }
            body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; margin: 0 !important; }
            .print-hide { display: none !important; }
            .print-main-content { margin-left: 0 !important; width: 100% !important; overflow: hidden !important; height: auto !important; padding: 5mm 5mm 60px 5mm !important; }
            .print-only { display: block !important; }
            .print-break-avoid { page-break-inside: avoid !important; break-inside: avoid !important; }
            .print-page-break { page-break-after: always !important; break-after: page !important; }
            .print-full-width { width: 100% !important; max-width: 100% !important; display: block !important; border-right: none !important; margin-bottom: 2rem !important; }
            .print-col-4 { width: 33.333333% !important; max-width: 33.333333% !important; float: left; display: inline-block !important; }
            .print-col-8 { width: 66.666667% !important; max-width: 66.666667% !important; float: left; display: inline-block !important; border-left: 1px solid #f9fafb; padding-left: 2rem; }
            .print-footer { display: block !important; position: fixed !important; bottom: 0 !important; left: 0 !important; width: 100% !important; background: white !important; padding: 10px 0 !important; text-align: center !important; z-index: 1000 !important; }
            .print-chart-scale { transform: scale(0.80) !important; transform-origin: top left !important; width: 125% !important; }
            ::-webkit-scrollbar { display: none; }
          }
          .print-only { display: none; }
        `}
      </style>
      <div className="min-h-screen bg-[#f8f9fa] text-gray-800 flex font-sans relative">
        <div id="dashboard-overview-container" className="flex-1 overflow-auto">
          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-white/60 backdrop-blur-md z-[9999] flex flex-col items-center justify-center animate-in fade-in duration-300">
              <div className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center gap-6">
                <div className="relative">
                  <RefreshCw size={64} className="text-red-600 animate-spin" />
                  <div className="absolute inset-0 bg-red-600/10 rounded-full blur-2xl animate-pulse" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter mb-2">Processando Dados</h3>
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Carregando, aguarde...</p>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar */}
          <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed h-full z-30 shadow-sm print-hide">
            <div className="p-8 flex justify-center border-b border-gray-50">
              <Link to="/" className="flex items-center">
                <div className="bg-[#D32F2F] px-4 py-3 rounded shadow-lg shadow-red-600/10">
                  <img
                    src="https://longwayalimentos.com.br/wp-content/uploads/2024/10/logo-branco-longway-1.svg"
                    alt="Long Way"
                    className="h-8 w-auto object-contain"
                  />
                </div>
              </Link>
            </div>

            <nav className="flex-grow p-4 space-y-1 mt-4">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'overview' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${activeTab === 'reports' ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <FileText size={16} />
                <span>Relatórios</span>
              </button>
              <button
                onClick={() => setActiveTab('tables')}
                className={`w-full flex items-center gap-3 px-6 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${(activeTab === 'tables' || (!['overview', 'reports'].includes(activeTab))) ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              >
                <FileSpreadsheet size={16} />
                <span>Tabelas</span>
              </button>
            </nav>

            <div className="p-6 border-t border-gray-50">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 text-gray-400 hover:text-red-500 font-bold text-xs uppercase tracking-widest transition-all"
              >
                <LogOut size={16} />
                <span>Encerrar Sessão</span>
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-grow lg:ml-64 p-8 max-w-[1440px] mx-auto w-full print-main-content">
            {/* Filters bar */}
            {activeTab !== 'tables' && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 mb-8 flex flex-wrap items-center gap-6 shadow-sm print-hide">
                <div className="flex items-center gap-3">
                  <Calendar size={16} className="text-red-600" />
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Intervalo de Produção:</span>
                  <div className="flex gap-2 text-xs font-mono">
                    <input
                      type="date"
                      className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded outline-none cursor-pointer hover:border-red-600 transition-all font-bold text-gray-600"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value);
                        if (workbook && selectedSheet) {
                          processSheetData(selectedSheet, workbook, e.target.value, endDate);
                        }
                      }}
                    />
                    <span className="text-gray-300 self-center">ATÉ</span>
                    <input
                      type="date"
                      className="bg-gray-50 border border-gray-100 px-3 py-1.5 rounded outline-none cursor-pointer hover:border-red-600 transition-all font-bold text-gray-600"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value);
                        if (workbook && selectedSheet) {
                          processSheetData(selectedSheet, workbook, startDate, e.target.value);
                        }
                      }}
                    />
                  </div>
                </div>

                {reportsHistory.length > 0 && (
                  <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
                    <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Arquivo Selecionado:</span>
                    <div className="relative group min-w-[200px]">
                      <select
                        value={currentReportId || ''}
                        onChange={(e) => {
                          const id = e.target.value;
                          if (id) {
                            handleLoadReport(id);
                          }
                        }}
                        className="appearance-none w-full bg-white border border-gray-200 px-4 py-1.5 pr-10 rounded text-xs font-bold text-gray-700 outline-none hover:border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all cursor-pointer truncate"
                      >
                        <option value="" disabled>Selecione um Arquivo</option>
                        {reportsHistory.map(report => (
                          <option key={report.id} value={report.id}>
                            {report.fileName} - {new Date(report.uploadDate).toLocaleDateString('pt-BR')}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                <div className="flex-grow" />
                <button
                  onClick={() => processSheetData(selectedSheet, workbook as XLSX.WorkBook)}
                  className="text-[10px] font-bold text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors"
                >
                  Resetar Filtros
                </button>
              </div>
            )}

            {activeTab === 'tables' ? (
              <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                <Tables />
              </div>
            ) : (!workbook && !uploadedData) ? (
              <div className="flex-grow flex flex-col items-center justify-center min-h-[60vh] bg-white border border-gray-100 rounded-2xl p-12 shadow-sm">
                <div className="bg-red-50 p-6 rounded-full mb-6">
                  <Upload size={48} className="text-red-600" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tight mb-2">Nenhum dado carregado</h2>
                <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">Por favor, suba um arquivo Excel para visualizar o dashboard</p>
                <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-red-600/20">
                  <Upload size={18} />
                  <span>Subir Relatório Agora</span>
                  <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                </label>
              </div>
            ) : (
              <>
                {activeTab === 'overview' ? (
                  <>
                    <header className="bg-white border border-gray-100 rounded-xl p-8 mb-8 shadow-sm print-page-break">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 pb-6 mb-6">
                        <div className="flex items-center gap-6">
                          <div>
                            <div className="print-only mb-6" style={{ display: 'none' }}>
                              <div className="bg-[#D32F2F] px-4 py-3 rounded shadow-lg shadow-red-600/10 inline-block">
                                <img
                                  src="https://longwayalimentos.com.br/wp-content/uploads/2024/10/logo-branco-longway-1.svg"
                                  alt="Long Way"
                                  className="h-8 w-auto object-contain"
                                />
                              </div>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight uppercase text-gray-800 mb-1 flex items-center gap-3">
                              <span className="w-1.5 h-6 bg-red-600 rounded-full print-hide" />
                              AVALIAÇÃO DE PESO - {fileName ? fileName.replace('.csv', '') : 'RELATÓRIO RQ'}
                            </h1>
                            <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] ml-0 print:ml-0 md:ml-4">SISTEMA DE MONITORAMENTO QUALITATIVO | LONG WAY ALIMENTOS</p>
                          </div>
                        </div>

                        <div className="flex gap-3 print-hide">
                          <button
                            onClick={generateDashboardPDF}
                            className="bg-white border border-red-200 hover:bg-red-50 text-red-600 px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm"
                          >
                            <FileText size={14} />
                            <span>Salvar PDF</span>
                          </button>
                          <label className="cursor-pointer bg-white border border-gray-200 hover:border-red-600 text-gray-600 hover:text-red-600 px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
                            <Upload size={14} />
                            <span>Subir Relatório</span>
                            <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                          </label>
                          <button
                            onClick={() => processSheetData(selectedSheet, workbook, startDate, endDate)}
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-600/20"
                          >
                            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                            <span>Atualizar</span>
                          </button>
                        </div>
                      </div>

                      {!stats ? (
                        <div className="p-20 text-center text-gray-400 font-black uppercase tracking-widest text-xs">Sem dados para o intervalo selecionado</div>
                      ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 after:content-[''] after:table-clear after:clear-both">
                          <div className="lg:col-span-4 border-r border-gray-50 pr-8 print-break-avoid print-col-4">
                            <h3 className="text-red-600 font-black text-xs uppercase tracking-widest mb-6 border-b border-red-50 pb-2">RESULTADOS DA AVALIAÇÃO</h3>
                            <div className="space-y-1">
                              <StatRow label="Qt produzida" value={stats.count.toLocaleString()} />
                              <StatRow label="Abaixo (Rejeição)" value={stats.rejection_count.toLocaleString()} color="text-red-600" />
                              <StatRow label="Taxa Abaixo %" value={`${stats.rejection_rate.toFixed(2)}%`} color="text-red-600" />
                              <StatRow label="Média do Processo" value={`${stats.mean.toFixed(2)}g`} color="text-blue-600" />
                              <StatRow label="Std Dev / Variab." value={`${stats.std.toFixed(2)}g`} />
                              <StatRow label="Conformidade %" value={`${stats.conformity_rate.toFixed(1)}%`} color="text-green-600" />
                              <StatRow label="Mínimo" value={`${stats.min.toFixed(1)}g`} />
                              <StatRow label="Máximo" value={`${stats.max.toFixed(1)}g`} />
                              <div className="mt-8 bg-yellow-50/50 p-4 rounded-lg flex justify-between items-center border border-yellow-100">
                                <span className="text-[10px] font-black text-yellow-700 uppercase">Perdas (Unidades)</span>
                                <span className="text-xl font-black text-yellow-800">{(stats.rejection_count * 1.5).toFixed(0)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="lg:col-span-8 print-break-avoid print-col-8">
                            <div className="mb-6">
                              <h3 className="text-gray-900 font-black text-lg uppercase tracking-tight">SÉRIE TEMPORAL DE PESOS</h3>
                              <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest -mt-1">Acompanhamento Amostral Chronológico</p>
                            </div>
                            <div className="h-[400px] w-full mt-4">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={timeSeries} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                                  <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />
                                  <XAxis
                                    dataKey="x"
                                    stroke="#64748b"
                                    fontSize={8}
                                    tick={{ fill: '#64748b' }}
                                    minTickGap={60}
                                    axisLine={{ stroke: '#cbd5e1' }}
                                  />
                                  <YAxis
                                    stroke="#64748b"
                                    fontSize={8}
                                    domain={[
                                      (dataMin: number) => Math.floor(Math.min(dataMin, stats.standardWeight, stats.mean) / 10) * 10 - 20,
                                      (dataMax: number) => Math.ceil(Math.max(dataMax, stats.standardWeight, stats.mean) / 10) * 10 + 20
                                    ]}
                                    axisLine={{ stroke: '#cbd5e1' }}
                                    tickLine={true}
                                    tick={{ fill: '#334155', fontWeight: 'bold' }}
                                  />
                                  <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#64748b' }}
                                  />
                                  {/* Reference Lines with NO internal labels as requested */}
                                  <ReferenceLine
                                    y={stats.standardWeight}
                                    stroke="#1e293b"
                                    strokeDasharray="5 5"
                                    strokeWidth={2}
                                  />
                                  <ReferenceLine
                                    y={stats.mean}
                                    stroke="#dc2626"
                                    strokeDasharray="3 3"
                                    strokeWidth={2}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="y"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    dot={{ r: 1.5, fill: '#3b82f6', strokeWidth: 0 }}
                                    activeDot={{ r: 4, strokeWidth: 0 }}
                                    animationDuration={1000}
                                  />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>

                            {/* CUSTOM RELIABLE LEGEND */}
                            <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mt-8 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-1 bg-[#3b82f6] rounded-full" />
                                <span className="text-[11px] font-black text-gray-900 uppercase tracking-wider">PESO INDIVIDUAL</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-1 border-t-2 border-dashed border-[#dc2626]" />
                                <span className="text-[11px] font-black text-red-600 uppercase tracking-wider">MÉDIA: {stats.mean.toFixed(1)}g</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-1 border-t-2 border-dashed border-[#1e293b]" />
                                <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">PADRÃO: {stats.standardWeight.toFixed(1)}g</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </header>

                    {stats && (
                      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm print-break-avoid w-full" style={{ overflow: 'hidden' }}>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                          <div>
                            <h3 className="text-gray-900 font-black text-sm uppercase tracking-widest flex items-center gap-3">
                              <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                              Distribuição de Frequência
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 ml-4 italic">
                              Quantidade de amostras por faixa de peso
                            </p>
                          </div>
                          <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                            <div className="w-3 h-3 bg-[#dc2626] rounded-sm" />
                            <span className="text-[10px] font-black text-blue-900 uppercase tracking-tighter">Frequência (Unidades)</span>
                          </div>
                        </div>

                        <div className="h-[300px] w-full print-chart-scale">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={distribution} margin={{ top: 40, right: 0, left: 60, bottom: 80 }} barCategoryGap="1%">
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                              <XAxis
                                dataKey="label"
                                stroke="#64748b"
                                fontSize={8}
                                axisLine={false}
                                tickLine={false}
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold', dy: 10 }}
                              />
                              <YAxis
                                stroke="#64748b"
                                fontSize={8}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 10, fill: '#64748b' }}
                                domain={[0, (dataMax: number) => Math.ceil(dataMax * 1.25)]}
                                label={{ value: 'QUANTIDADE (AMOSTRAS)', angle: -90, position: 'insideLeft', offset: -45, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                              />
                              <Tooltip
                                cursor={{ fill: '#f8f9fa' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`${value} unidades`, 'Frequência']}
                              />
                              <Bar
                                dataKey="value"
                                fill="#dc2626"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={30}
                                label={{ position: 'top', fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                              />
                              {/* Linha de Referência - Média */}
                              {(() => {
                                const meanLabel = distribution?.find((d: any) => {
                                  const parts = d.label.replace('g', '').split('-');
                                  if (parts.length === 2) {
                                    const bMin = parseFloat(parts[0]);
                                    const bMax = parseFloat(parts[1]);
                                    return stats.mean >= bMin && stats.mean < bMax;
                                  }
                                  return false;
                                })?.label;
                                return meanLabel ? <ReferenceLine x={meanLabel} stroke="#dc2626" strokeDasharray="3 3" strokeWidth={2} label={{ value: 'MÉDIA', position: 'top', fill: '#dc2626', fontSize: 10, fontWeight: 'bold' }} /> : null;
                              })()}
                              {/* Linha de Referência - Padrão */}
                              {(() => {
                                const stdLabel = distribution?.find((d: any) => {
                                  const parts = d.label.replace('g', '').split('-');
                                  if (parts.length === 2) {
                                    const bMin = parseFloat(parts[0]);
                                    const bMax = parseFloat(parts[1]);
                                    return stats.standardWeight >= bMin && stats.standardWeight < bMax;
                                  }
                                  return false;
                                })?.label;
                                return stdLabel ? <ReferenceLine x={stdLabel} stroke="#1e293b" strokeDasharray="5 5" strokeWidth={2} label={{ value: 'PADRÃO', position: 'top', fill: '#1e293b', fontSize: 10, fontWeight: 'bold' }} /> : null;
                              })()}
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Legenda do Gráfico de Frequência */}
                        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mt-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-[#dc2626] rounded-sm" />
                            <span className="text-[11px] font-black text-gray-900 uppercase tracking-wider">Frequência</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-1 border-t-2 border-dashed border-[#dc2626]" />
                            <span className="text-[11px] font-black text-red-600 uppercase tracking-wider">MÉDIA: {stats.mean.toFixed(1)}g</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-1 border-t-2 border-dashed border-[#1e293b]" />
                            <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">PADRÃO: {stats.standardWeight.toFixed(1)}g</span>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* GRÁFICO DE MÉDIAS DIÁRIAS */}
                    {uploadedData?.dailyAverages && uploadedData.dailyAverages.length > 0 && (
                      <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm mt-8 print-break-avoid w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b border-gray-50">
                          <div>
                            <h3 className="text-gray-900 font-black text-sm uppercase tracking-widest flex items-center gap-3">
                              <span className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                              Média de Peso Diária
                            </h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 ml-4 italic">
                              Acompanhamento das médias gramatura por dia do mês
                            </p>
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                              <Calendar size={14} className="text-emerald-600" />
                              <select
                                value={selectedDailyMonth}
                                onChange={(e) => setSelectedDailyMonth(e.target.value)}
                                className="bg-transparent border-none text-[10px] font-black text-emerald-900 uppercase tracking-tighter outline-none cursor-pointer"
                              >
                                {Array.from(new Set(uploadedData.dailyAverages.map((d: any) => d.month))).sort().reverse().map(m => {
                                  const [year, month] = (m as string).split('-');
                                  const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('pt-BR', { month: 'long' });
                                  return (
                                    <option key={m as string} value={m as string} className="bg-white">
                                      {monthName.toUpperCase()} / {year}
                                    </option>
                                  );
                                })}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={uploadedData.dailyAverages.filter((d: any) => d.month === selectedDailyMonth)}
                              margin={{ top: 40, right: 30, left: 60, bottom: 40 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                              <XAxis
                                dataKey="day"
                                stroke="#64748b"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                label={{ value: 'DIA DO MÊS', position: 'bottom', offset: 20, fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }}
                              />
                              <YAxis
                                stroke="#64748b"
                                fontSize={10}
                                axisLine={false}
                                tickLine={false}
                                domain={[(dataMin: number) => Math.floor(dataMin - 5), (dataMax: number) => Math.ceil(dataMax * 1.25)]}
                                label={{ value: 'MÉDIA (g)', angle: -90, position: 'insideLeft', offset: -10, fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                              />
                              <Tooltip
                                cursor={{ fill: '#f8f9fa' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: any) => [`${value}g`, 'Média Diária']}
                              />
                              <ReferenceLine y={stats?.mean} stroke="#dc2626" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'MÉDIA GERAL', position: 'right', fill: '#dc2626', fontSize: 8, fontWeight: 'bold' }} />
                              <ReferenceLine y={stats?.standardWeight} stroke="#1e293b" strokeDasharray="5 5" strokeWidth={1} label={{ value: 'PADRÃO', position: 'right', fill: '#1e293b', fontSize: 8, fontWeight: 'bold' }} />
                              <Bar
                                dataKey="value"
                                fill="#10b981"
                                radius={[4, 4, 0, 0]}
                                barSize={40}
                                label={{ position: 'top', fill: '#059669', fontSize: 10, fontWeight: 'bold' }}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Legenda do Gráfico de Médias */}
                        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 mt-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100/50">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-[#10b981] rounded-sm" />
                            <span className="text-[11px] font-black text-gray-900 uppercase tracking-wider">Média Diária</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-1 border-t-2 border-dashed border-[#dc2626]" />
                            <span className="text-[11px] font-black text-red-600 uppercase tracking-wider">MÉDIA GERAL: {stats?.mean?.toFixed(1)}g</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-1 border-t-2 border-dashed border-[#1e293b]" />
                            <span className="text-[11px] font-black text-gray-700 uppercase tracking-wider">PESO PADRÃO: {stats?.standardWeight?.toFixed(1)}g</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>

                ) : activeTab === 'reports' && !viewingReportTable ? (
                  <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
                      <h3 className="text-gray-900 font-black text-sm uppercase tracking-widest flex items-center gap-3">
                        <span className="w-1.5 h-4 bg-orange-500 rounded-full" />
                        Histórico de Relatórios
                      </h3>
                      <label className="cursor-pointer bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
                        <Upload size={14} />
                        <span>Subir Novo Relatório</span>
                        <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                      </label>
                    </div>
                    {reportsHistory.length === 0 ? (
                      <div className="p-12 text-center text-gray-400 font-bold text-xs uppercase tracking-widest border-2 border-dashed border-gray-100 rounded-xl">
                        Nenhum relatório salvo no histórico local.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                              <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Arquivo</th>
                              <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Usuário</th>
                              <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-wider">Data</th>
                              <th className="p-4 text-[10px] font-black uppercase text-gray-400 tracking-wider text-right">Ação</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {reportsHistory.map(report => (
                              <tr key={report.id} onDoubleClick={() => handleLoadReport(report.id, true)} className="hover:bg-orange-50/30 transition-colors cursor-pointer group">
                                <td className="p-4 text-xs font-bold text-gray-700">{report.fileName}</td>
                                <td className="p-4 text-xs text-gray-500 uppercase tracking-widest">{report.userName}</td>
                                <td className="p-4 text-xs text-gray-500 font-mono">{new Date(report.uploadDate).toLocaleString('pt-BR')}</td>
                                <td className="p-4 text-right">
                                  <button onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
                      <div className="flex items-center gap-4">
                        {activeTab === 'reports' && (
                          <button
                            onClick={() => setViewingReportTable(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                            title="Voltar ao Histórico"
                          >
                            <ChevronLeft size={20} />
                          </button>
                        )}
                        <h3 className="text-gray-800 font-black text-sm uppercase tracking-widest flex items-center gap-3 border-l border-gray-200 pl-4">
                          TABELA DE DADOS COMPLETA
                        </h3>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total: {fullTableData.length > 0 ? (fullTableData.length - 1).toLocaleString() : 0} linhas</span>
                        {totalPages > 1 && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                              disabled={currentPage === 1}
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <span className="text-[10px] font-bold text-gray-700">PÁGINA {currentPage} DE {totalPages}</span>
                            <button
                              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                              className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                              disabled={currentPage === totalPages}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                          <tr className="bg-gray-50">
                            {tableHeaders.map((col, idx) => (
                              <th key={idx} className="p-4 text-[10px] font-black uppercase text-gray-400 border-b border-gray-100 whitespace-nowrap">{String(col)}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {paginatedData.slice(currentPage === 1 ? 1 : 0).map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                              {row.map((cell, idx) => {
                                const hdr = String(tableHeaders[idx] || '').toUpperCase().trim();
                                const isPossivelTroca = hdr === 'POSSIVEL TROCA' || hdr === 'POSSÍVEL TROCA';

                                return (
                                  <td key={idx} className="p-4 text-xs font-bold text-gray-600 border-b border-gray-50/50">
                                    {isPossivelTroca ? (
                                      <select
                                        value={cell || ''}
                                        onChange={(e) => handlePossivelTrocaChange(currentPage === 1 ? i + 1 : (currentPage - 1) * rowsPerPage + i, e.target.value)}
                                        className={`border rounded px-2 py-1 bg-white text-xs outline-none focus:border-red-500 font-bold transition-colors ${cell === 'Sim' ? 'text-orange-600 border-orange-200 bg-orange-50' : cell === 'Não' ? 'text-green-600 border-green-200 bg-green-50' : 'text-gray-600 border-gray-200'}`}
                                      >
                                        <option value="">Selecione</option>
                                        <option value="Sim">Sim</option>
                                        <option value="Não">Não</option>
                                      </select>
                                    ) : (
                                      formatCellValue(cell, idx, String(tableHeaders[idx] || ''))
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                          {fullTableData.length <= 1 && (
                            <tr>
                              <td colSpan={tableHeaders.length || 1} className="p-20 text-center text-gray-300 font-black uppercase tracking-widest text-xs">Nenhum dado encontrado para este intervalo</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}

            <footer className="mt-16 py-8 text-center border-t border-gray-100 print-footer">
              <div className="flex justify-center gap-8 mb-4 opacity-50 grayscale">
                <img src="https://longwayalimentos.com.br/wp-content/uploads/2024/10/logo-branco-longway-1.svg" alt="Long Way" className="h-6 brightness-0" />
              </div>
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">Monitoramento de Qualidade © 2026</p>
            </footer>
          </main>
        </div>
      </div>
    </>
  );
}
