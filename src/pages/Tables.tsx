import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Save, Plus, FileSpreadsheet, Download } from 'lucide-react';
import { exportToExcel } from '../utils/exportExcel';
import toast from 'react-hot-toast';

// Tipos baseados nas nossas tabelas extraídas:
// Produto, Emb., Bandeja, Liquido, Bruto, Inferior (LIC), Limites Superior (LSC) / Packing
interface TableRow {
    id: string; // Gerador de id falso
    produto: string;
    emb: string;
    bandeja: string;
    liquido: string;
    bruto: string;
    inferiorLIC: string;
    superiorLSC_Packing: string;
}

const INITIAL_DATA_GS: TableRow[] = [
    { id: '1', produto: 'GS', emb: '6', bandeja: '13', liquido: '240', bruto: '259', inferiorLIC: '259', superiorLSC_Packing: 'nan' },
    { id: '2', produto: 'GB', emb: '6', bandeja: '13', liquido: '240', bruto: '259', inferiorLIC: '259', superiorLSC_Packing: 'nan' },
    { id: '3', produto: 'GL', emb: '6', bandeja: '13', liquido: '240', bruto: '259', inferiorLIC: '259', superiorLSC_Packing: 'nan' },
    { id: '4', produto: 'GNb', emb: '6', bandeja: '13', liquido: '240', bruto: '259', inferiorLIC: '259', superiorLSC_Packing: 'nan' },
    { id: '5', produto: 'RC', emb: '6', bandeja: '11', liquido: '225', bruto: '242', inferiorLIC: '242', superiorLSC_Packing: 'nan' },
    { id: '6', produto: 'RQ', emb: '6', bandeja: '11', liquido: '185', bruto: '202', inferiorLIC: '202', superiorLSC_Packing: 'nan' },
    { id: '7', produto: 'RL', emb: '6', bandeja: '11', liquido: '225', bruto: '242', inferiorLIC: '242', superiorLSC_Packing: 'nan' },
    { id: '8', produto: 'RF', emb: '6', bandeja: '11', liquido: '225', bruto: '242', inferiorLIC: '242', superiorLSC_Packing: 'nan' },
    { id: '9', produto: 'RB', emb: '6', bandeja: '11', liquido: '225', bruto: '242', inferiorLIC: '242', superiorLSC_Packing: 'nan' },
    { id: '10', produto: 'NSb', emb: '6', bandeja: '12', liquido: '400', bruto: '418', inferiorLIC: '418', superiorLSC_Packing: 'nan' },
    { id: '11', produto: 'NBb', emb: '6', bandeja: '12', liquido: '400', bruto: '418', inferiorLIC: '418', superiorLSC_Packing: 'nan' },
    { id: '12', produto: 'NFb', emb: '6', bandeja: '12', liquido: '400', bruto: '418', inferiorLIC: '418', superiorLSC_Packing: 'nan' },
    { id: '13', produto: 'NLb', emb: '6', bandeja: '12', liquido: '400', bruto: '418', inferiorLIC: '418', superiorLSC_Packing: 'nan' },
    { id: '14', produto: 'mRQ', emb: '6', bandeja: 'nan', liquido: '400', bruto: '406', inferiorLIC: '406', superiorLSC_Packing: '420' },
    { id: '15', produto: 'mRL', emb: '6', bandeja: 'nan', liquido: '400', bruto: '406', inferiorLIC: '406', superiorLSC_Packing: '420' },
    { id: '16', produto: 'mRD', emb: '6', bandeja: 'nan', liquido: '400', bruto: '406', inferiorLIC: '406', superiorLSC_Packing: '420' }
];

const INITIAL_DATA_RQ: TableRow[] = [
    ...INITIAL_DATA_GS // A tabela RQ na extração tinha exatamente as mesmas linhas inciais.
];

const INITIAL_DATA_HS: TableRow[] = [
    { id: '1', produto: 'HS', emb: '6', bandeja: '0', liquido: '320', bruto: '326', inferiorLIC: '326', superiorLSC_Packing: 'Vertical' },
    { id: '2', produto: 'HB', emb: '6', bandeja: '0', liquido: '320', bruto: '326', inferiorLIC: '326', superiorLSC_Packing: 'Vertical' },
    { id: '3', produto: 'HL', emb: '6', bandeja: '0', liquido: '320', bruto: '326', inferiorLIC: '326', superiorLSC_Packing: 'Vertical' },
    { id: '4', produto: 'PS', emb: '6', bandeja: '0', liquido: '240', bruto: '246', inferiorLIC: '246', superiorLSC_Packing: 'Vertical' },
    { id: '5', produto: 'PK', emb: '6', bandeja: '0', liquido: '240', bruto: '246', inferiorLIC: '246', superiorLSC_Packing: 'Vertical' },
    { id: '6', produto: 'PP', emb: '6', bandeja: '0', liquido: '240', bruto: '246', inferiorLIC: '246', superiorLSC_Packing: 'Vertical' },
    { id: '7', produto: 'PF', emb: '6', bandeja: '0', liquido: '240', bruto: '246', inferiorLIC: '246', superiorLSC_Packing: 'Vertical' },
    { id: '8', produto: 'PR', emb: '6', bandeja: '0', liquido: '240', bruto: '246', inferiorLIC: '246', superiorLSC_Packing: 'Vertical' },
    { id: '9', produto: 'CS', emb: '8', bandeja: '0', liquido: '600', bruto: '608', inferiorLIC: '608', superiorLSC_Packing: 'Vertical' },
    { id: '10', produto: 'CL', emb: '8', bandeja: '0', liquido: '600', bruto: '608', inferiorLIC: '608', superiorLSC_Packing: 'Vertical' },
    { id: '11', produto: 'GNs', emb: '9', bandeja: '0', liquido: '720', bruto: '729', inferiorLIC: '729', superiorLSC_Packing: 'Vertical' },
    { id: '12', produto: 'NBs', emb: '12', bandeja: '0', liquido: '1000', bruto: '1012', inferiorLIC: '1012', superiorLSC_Packing: 'Vertical' },
    { id: '13', produto: 'NFs', emb: '12', bandeja: '0', liquido: '1000', bruto: '1012', inferiorLIC: '1012', superiorLSC_Packing: 'Vertical' },
    { id: '14', produto: 'NSs', emb: '12', bandeja: '0', liquido: '1000', bruto: '1012', inferiorLIC: '1012', superiorLSC_Packing: 'Vertical' },
    { id: '15', produto: 'NM', emb: '11', bandeja: '0', liquido: '720', bruto: '731', inferiorLIC: '731', superiorLSC_Packing: 'Vertical' },
    { id: '16', produto: 'BL', emb: '12', bandeja: '0', liquido: '720', bruto: '732', inferiorLIC: '732', superiorLSC_Packing: 'Vertical' },
    { id: '17', produto: 'BM', emb: '9', bandeja: '0', liquido: '324', bruto: '333', inferiorLIC: '333', superiorLSC_Packing: 'Vertical' },
    { id: '18', produto: 'mRQ', emb: '6', bandeja: '0', liquido: '400', bruto: '406', inferiorLIC: '406', superiorLSC_Packing: 'Vertical' },
    { id: '19', produto: 'mRL', emb: '6', bandeja: '0', liquido: '400', bruto: '406', inferiorLIC: '406', superiorLSC_Packing: 'Vertical' },
    { id: '20', produto: 'mRD', emb: '6', bandeja: '0', liquido: '400', bruto: '406', inferiorLIC: '406', superiorLSC_Packing: 'Vertical' }
];

export default function Tables() {
    const [activeTab, setActiveTab] = useState<'GS' | 'RQ' | 'HS'>('GS');

    // States para cada tabela
    const [dataGS, setDataGS] = useState<TableRow[]>([]);
    const [dataRQ, setDataRQ] = useState<TableRow[]>([]);
    const [dataHS, setDataHS] = useState<TableRow[]>([]);

    const [isClient, setIsClient] = useState(false);

    // States para o formulário
    const [newRow, setNewRow] = useState({
        produto: '',
        emb: '',
        bandeja: '',
        liquido: '',
        bruto: '',
        inferiorLIC: '',
        superiorLSC_Packing: ''
    });

    // Load from local storage on mount
    useEffect(() => {
        setIsClient(true);
        const savedGS = localStorage.getItem('longway_tables_GS');
        const savedRQ = localStorage.getItem('longway_tables_RQ');
        const savedHS = localStorage.getItem('longway_tables_HS');

        setDataGS(savedGS ? JSON.parse(savedGS) : INITIAL_DATA_GS);
        setDataRQ(savedRQ ? JSON.parse(savedRQ) : INITIAL_DATA_RQ);
        setDataHS(savedHS ? JSON.parse(savedHS) : INITIAL_DATA_HS);
    }, []);

    // Save changes to local storage
    const saveToStorage = (tab: string, newData: TableRow[]) => {
        localStorage.setItem(`longway_tables_${tab}`, JSON.stringify(newData));
    };

    const handleAddRow = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newRow.produto) return;

        const rowToAdd: TableRow = {
            ...newRow,
            id: Math.random().toString(36).substr(2, 9)
        };

        if (activeTab === 'GS') {
            const updated = [...dataGS, rowToAdd];
            setDataGS(updated);
            saveToStorage('GS', updated);
        } else if (activeTab === 'RQ') {
            const updated = [...dataRQ, rowToAdd];
            setDataRQ(updated);
            saveToStorage('RQ', updated);
        } else {
            const updated = [...dataHS, rowToAdd];
            setDataHS(updated);
            saveToStorage('HS', updated);
        }

        // Reset Form
        setNewRow({
            produto: '', emb: '', bandeja: '', liquido: '',
            bruto: '', inferiorLIC: '', superiorLSC_Packing: ''
        });
    };

    const deleteRow = (id: string, tab: 'GS' | 'RQ' | 'HS') => {
        toast((t) => (
            <div>
                <p className="mb-3">Tem certeza que deseja excluir esta linha?</p>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            executeDelete(id, tab);
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 focus:outline-none"
                    >
                        Excluir
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm hover:bg-gray-300 focus:outline-none"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    const executeDelete = (id: string, tab: 'GS' | 'RQ' | 'HS') => {
        if (tab === 'GS') {
            const updated = dataGS.filter(row => row.id !== id);
            setDataGS(updated);
            saveToStorage('GS', updated);
        } else if (tab === 'RQ') {
            const updated = dataRQ.filter(row => row.id !== id);
            setDataRQ(updated);
            saveToStorage('RQ', updated);
        } else {
            const updated = dataHS.filter(row => row.id !== id);
            setDataHS(updated);
            saveToStorage('HS', updated);
        }
        toast.success('Linha removida com sucesso');
    };

    const currentData = activeTab === 'GS' ? dataGS : activeTab === 'RQ' ? dataRQ : dataHS;

    if (!isClient) return null;

    return (
        <div className="animate-in fade-in duration-300">
            <div className="w-full">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <FileSpreadsheet className="text-red-600 h-8 w-8" />
                            Tabelas de Pesos e Produtos
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Gerencie e adicione dados baseados nas planilhas (Relatórios Horizontal e Vertical).
                        </p>
                    </div>
                    <button
                        onClick={() => exportToExcel(currentData, `Exportacao_Tabela_${activeTab}`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
                    >
                        <Download size={16} />
                        Extrair para Excel
                    </button>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 mb-6 flex overflow-x-auto space-x-2">
                    {['GS', 'RQ', 'HS'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as 'GS' | 'RQ' | 'HS')}
                            className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-red-600'
                                }`}
                        >
                            {tab === 'GS' ? 'Relatório Horizontal - GS' :
                                tab === 'RQ' ? 'Relatório Horizontal - RQ' :
                                    'Relatório Vertical - HS'}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-4 gap-8">

                    {/* Formulário de Adição */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-4"
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Plus size={20} className="text-red-600" />
                                Adicionar Novo
                            </h3>

                            <form onSubmit={handleAddRow} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Produto *</label>
                                    <input
                                        required
                                        type="text"
                                        value={newRow.produto}
                                        onChange={(e) => setNewRow({ ...newRow, produto: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                                        placeholder="Ex: GS"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Emb.</label>
                                        <input
                                            type="text"
                                            value={newRow.emb}
                                            onChange={(e) => setNewRow({ ...newRow, emb: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Bandeja</label>
                                        <input
                                            type="text"
                                            value={newRow.bandeja}
                                            onChange={(e) => setNewRow({ ...newRow, bandeja: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Líquido (g)</label>
                                        <input
                                            type="text"
                                            value={newRow.liquido}
                                            onChange={(e) => setNewRow({ ...newRow, liquido: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Bruto (g)</label>
                                        <input
                                            type="text"
                                            value={newRow.bruto}
                                            onChange={(e) => setNewRow({ ...newRow, bruto: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Inferior (LIC)</label>
                                    <input
                                        type="text"
                                        value={newRow.inferiorLIC}
                                        onChange={(e) => setNewRow({ ...newRow, inferiorLIC: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        {activeTab === 'HS' ? 'Packing' : 'Limites Superior (LSC)'}
                                    </label>
                                    <input
                                        type="text"
                                        value={newRow.superiorLSC_Packing}
                                        onChange={(e) => setNewRow({ ...newRow, superiorLSC_Packing: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent text-sm"
                                    />
                                </div>

                                <hr className="my-4 border-gray-100" />

                                <button
                                    type="submit"
                                    className="w-full bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <Save size={18} />
                                    Salvar na Tabela
                                </button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Área da Tabela */}
                    <div className="lg:col-span-3">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">Produto</th>
                                            <th className="px-6 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">Emb.</th>
                                            <th className="px-6 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">Bandeja</th>
                                            <th className="px-6 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">Líquido (g)</th>
                                            <th className="px-6 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">Bruto (g)</th>
                                            <th className="px-6 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">Inferior (LIC)</th>
                                            <th className="px-6 py-4 font-semibold text-gray-900 text-sm whitespace-nowrap">
                                                {activeTab === 'HS' ? 'Packing' : 'Superior (LSC)'}
                                            </th>
                                            <th className="px-6 py-4 font-semibold text-gray-900 text-sm text-right">Ação</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {currentData.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-8 text-center text-gray-500 text-sm">
                                                    Nenhum dado cadastrado nesta tabela.
                                                </td>
                                            </tr>
                                        ) : (
                                            currentData.map((row) => (
                                                <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-3.5 text-sm font-medium text-gray-900 whitespace-nowrap">{row.produto}</td>
                                                    <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">{row.emb}</td>
                                                    <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">{row.bandeja}</td>
                                                    <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">{row.liquido}</td>
                                                    <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">{row.bruto}</td>
                                                    <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">{row.inferiorLIC}</td>
                                                    <td className="px-6 py-3.5 text-sm text-gray-600 whitespace-nowrap">{row.superiorLSC_Packing}</td>
                                                    <td className="px-6 py-3.5 text-sm text-right">
                                                        <button
                                                            onClick={() => deleteRow(row.id, activeTab)}
                                                            className="text-red-500 hover:text-red-700 font-medium text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            Excluir
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
}
