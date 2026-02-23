
import { useState, ChangeEvent, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Legend
} from 'recharts';
import {
  TrendingUp, Users, Package, AlertTriangle, FileText, LayoutDashboard, LogOut, RefreshCw, Upload, Calendar, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';

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

  // Table Pagination State
  const [fullTableData, setFullTableData] = useState<any[][]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  const stats = uploadedData?.stats;
  const timeSeries = uploadedData?.timeSeries;
  const distribution = uploadedData?.distribution;

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  // Helper to excel date to JS Date
  const excelToJSDate = (serial: any) => {
    if (typeof serial !== 'number') return null;
    return new Date(Math.round((serial - 25569) * 86400 * 1000));
  };

  const parseExcelDate = (val: any) => {
    if (val === null || val === undefined || val === '') return null;

    // If it's already an Excel serial number
    if (typeof val === 'number') {
      return excelToJSDate(val);
    }

    // If it's a string, try various formats
    if (typeof val === 'string') {
      // Support "2025/11/27", "27/11/2025", "2025-11-27"
      const parts = val.split(/[/-]/);
      if (parts.length === 3) {
        // Check if first part is year (YYYY/MM/DD)
        if (parts[0].length === 4) {
          return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        }
        // Check if last part is year (DD/MM/YYYY)
        if (parts[2].length === 4) {
          return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        }
      }

      const d = new Date(val);
      if (!isNaN(d.getTime())) return d;
    }

    return null;
  };

  // Helper to format Excel values
  const formatCellValue = (value: any, colIdx: number, header: string = "") => {
    if (value === null || value === undefined || value === '') return '';

    const h = header.toLowerCase();

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
    }

    if (typeof value === 'number') {
      if (h.includes('peso') || h.includes('weight')) {
        return value.toFixed(2) + 'g';
      }
      return value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    }

    return String(value);
  };

  const processSheetData = (sheetName: string, wb: XLSX.WorkBook, sDate?: string, eDate?: string) => {
    try {
      const sheet = wb.Sheets[sheetName];
      const allData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      if (allData.length < 2) return;

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

      // Extract weights and standard weight from filtered rows
      const weights: number[] = [];
      let standardWeight: number = 202; // Fallback default

      filteredRows.forEach(row => {
        const col0 = String(row[0] || '');
        const parts = col0.match(/"([^"]*)"|([^,]+)/g);

        if (parts && parts.length >= 4) {
          const w = parseFloat(parts[3].replace(/"/g, ''));
          if (!isNaN(w)) weights.push(w);

          // Try to find "Peso Padrão" in the parts (often index 7 or 8 depending on the sheet)
          if (parts.length >= 8) {
            const pStd = parseFloat(parts[7].replace(/"/g, ''));
            if (!isNaN(pStd)) standardWeight = pStd;
          }
        } else {
          // Fallback: look for numeric values in row
          row.forEach((cell, idx) => {
            const header = headers[idx] || '';
            const v = parseFloat(String(cell));
            if (!isNaN(v)) {
              if (header.includes('peso') && !header.includes('padrão')) {
                if (v > 50 && v < 2000) weights.push(v);
              }
              if (header.includes('padrão')) {
                standardWeight = v;
              }
            }
          });
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

      // Representative Sampling for Time Series (e.g., max 300 points)
      const maxPoints = 300;
      let timeSeriesData = [];
      if (weights.length <= maxPoints) {
        timeSeriesData = weights.map((w, i) => ({ x: i + 1, y: w }));
      } else {
        const step = weights.length / maxPoints;
        for (let i = 0; i < maxPoints; i++) {
          const idx = Math.floor(i * step);
          timeSeriesData.push({ x: idx + 1, y: weights[idx] });
        }
      }

      const labels = ['<190g', '190-200g', '200-210g', '210-220g', '220-230g', '230-240g', '240-250g', '250+g'];
      const bins = [0, 190, 200, 210, 220, 230, 240, 250, 9999];
      const distribution = labels.map((label, i) => ({
        label,
        value: weights.filter(w => w >= bins[i] && w < bins[i + 1]).length
      }));

      setUploadedData({
        stats: newStats,
        timeSeries: timeSeriesData,
        distribution
      });
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

          processSheetData(initialSheet, wb);

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
    <div className="min-h-screen bg-[#f8f9fa] text-gray-800 flex font-sans relative">
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
      <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col fixed h-full z-30 shadow-sm">
        <div className="p-8 flex justify-center border-b border-gray-50">
          <Link to="/" className="flex items-center">
            <div className="bg-[#dc2626] px-4 py-3 rounded shadow-lg shadow-red-600/10">
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
      <main className="flex-grow lg:ml-64 p-8 max-w-[1440px] mx-auto w-full">
        {/* Filters bar */}
        <div className="bg-white border border-gray-100 rounded-xl p-4 mb-8 flex flex-wrap items-center gap-6 shadow-sm">
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

          {activeTab === 'reports' && availableSheets.length > 0 && (
            <div className="flex items-center gap-3 border-l border-gray-100 pl-6">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Base (Aba):</span>
              <div className="relative group">
                <select
                  value={selectedSheet}
                  onChange={(e) => onSheetChange(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 px-6 py-1.5 pr-10 rounded text-xs font-bold text-gray-700 outline-none hover:border-red-600 transition-all cursor-pointer"
                >
                  {availableSheets.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
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

        {!workbook ? (
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
                <header className="bg-white border border-gray-100 rounded-xl p-8 mb-8 shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-50 pb-6 mb-6">
                    <div>
                      <h1 className="text-2xl font-black tracking-tight uppercase text-gray-800 mb-1 flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                        AVALIAÇÃO DE PESO - RELATÓRIO RQ
                      </h1>
                      <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.2em] ml-4">SISTEMA DE MONITORAMENTO QUALITATIVO | LONG WAY ALIMENTOS</p>
                    </div>

                    <div className="flex gap-3">
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
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                      <div className="lg:col-span-4 border-r border-gray-50 pr-8">
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

                      <div className="lg:col-span-8">
                        <div className="mb-6">
                          <h3 className="text-gray-900 font-black text-lg uppercase tracking-tight">SÉRIE TEMPORAL DE PESOS</h3>
                          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest -mt-1">Acompanhamento Amostral Chronológico</p>
                        </div>
                        <div className="h-[400px] w-full mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={timeSeries} margin={{ top: 20, right: 100, left: 10, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#e2e8f0" />
                              <XAxis
                                dataKey="x"
                                stroke="#64748b"
                                fontSize={10}
                                tick={{ fill: '#64748b' }}
                                minTickGap={30}
                                axisLine={{ stroke: '#cbd5e1' }}
                              />
                              <YAxis
                                stroke="#64748b"
                                fontSize={10}
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
                  <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                    <h3 className="text-gray-800 font-black text-sm uppercase tracking-widest mb-8 flex items-center gap-3">
                      <span className="w-1.5 h-4 bg-blue-500 rounded-full" />
                      Distribuição de Frequência
                    </h3>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distribution}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                          <XAxis dataKey="label" stroke="#babcbe" fontSize={10} axisLine={false} tickLine={false} />
                          <YAxis stroke="#babcbe" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip cursor={{ fill: '#f8f9fa' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Bar dataKey="value" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8 border-b border-gray-50 pb-4">
                  <h3 className="text-gray-800 font-black text-sm uppercase tracking-widest flex items-center gap-3">
                    <span className="w-1.5 h-4 bg-red-600 rounded-full" />
                    TABELA DE DADOS COMPLETA
                  </h3>
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
                          {row.map((cell, idx) => (
                            <td key={idx} className="p-4 text-xs font-bold text-gray-600 border-b border-gray-50/50">
                              {formatCellValue(cell, idx, String(tableHeaders[idx] || ''))}
                            </td>
                          ))}
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

        <footer className="mt-16 py-8 text-center border-t border-gray-100">
          <div className="flex justify-center gap-8 mb-4 opacity-50 grayscale">
            <img src="https://longwayalimentos.com.br/wp-content/uploads/2024/10/logo-branco-longway-1.svg" alt="Long Way" className="h-6 brightness-0" />
          </div>
          <p className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.3em]">Monitoramento de Qualidade © 2026</p>
        </footer>
      </main>
    </div>
  );
}
