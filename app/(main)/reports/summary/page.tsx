'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { formatDate, isDateInRange } from '@/lib/date';
import { exportToCSV } from '@/lib/export';

interface Member {
    id: number;
    sl_no: number;
    name: string;
    joining_date?: string;
    mobile?: string;
    address?: string;
    share_count: number;
    expected_amount: number;
    remarks?: string;
    total_deposit: number;
    total_penalty: number;
    total_realized: number;
    surplus_deficit: number;
}

interface Installment {
    id: number;
    member_id: number;
    installment_type: string;
    month_name: string;
    deposit_date?: string;
    deposit_amount: number;
    penalty_amount: number;
    remarks?: string;
}

interface Expense {
    id: number;
    sl_no: number;
    expense_title: string;
    location?: string;
    payment_method: string;
    expense_date?: string;
    amount: number;
    remarks?: string;
}

const OverallSummaryReport = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const [members, setMembers] = useState<Member[]>([]);
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const formatCurrency = (amount: number) => {
        return (
            '৳ ' +
            Number(amount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [memRes, instRes, expRes] = await Promise.all([fetch('/api/members'), fetch('/api/installments'), fetch('/api/expenses')]);

            const memData = await memRes.json();
            const instData = await instRes.json();
            const expData = await expRes.json();

            if (memData.success) setMembers(memData.data);
            if (instData.success) setInstallments(instData.data);
            if (expData.success) setExpenses(expData.data);
        } catch (err) {
            console.error('Failed to load summary report data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter installments & expenses by Date Range
    const filteredInstallments = installments.filter((inst) => isDateInRange(inst.deposit_date, fromDate, toDate));
    const filteredExpenses = expenses.filter((exp) => isDateInRange(exp.expense_date, fromDate, toDate));

    // Compute dynamic member totals based on date filter
    const displayMembers: Member[] = members.map((m) => {
        const mInsts = filteredInstallments.filter((i) => Number(i.member_id) === m.id);
        const total_deposit = mInsts.reduce((sum, i) => sum + Number(i.deposit_amount || 0), 0);
        const total_penalty = mInsts.reduce((sum, i) => sum + Number(i.penalty_amount || 0), 0);
        const total_realized = total_deposit + total_penalty;
        const surplus_deficit = total_realized - m.expected_amount;

        return {
            ...m,
            total_deposit,
            total_penalty,
            total_realized,
            surplus_deficit
        };
    });

    // Summary Cards metrics
    const totalDeposit = displayMembers.reduce((sum, m) => sum + m.total_deposit, 0);
    const totalPenalty = displayMembers.reduce((sum, m) => sum + m.total_penalty, 0);
    const totalRealized = displayMembers.reduce((sum, m) => sum + m.total_realized, 0);
    const totalShares = displayMembers.reduce((sum, m) => sum + Number(m.share_count || 0), 0);
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const netBalance = totalRealized - totalExpenses;

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        const headers = ['SL', 'Name', 'Mobile No', 'Address', 'Shares', 'Total Deposit (BDT)', 'Total Penalty (BDT)', 'Total Realized (BDT)', 'Surplus / Deficit (BDT)', 'Remarks'];
        const rows = displayMembers.map((m) => [m.sl_no, m.name, m.mobile || '', m.address || '', m.share_count, m.total_deposit, m.total_penalty, m.total_realized, m.surplus_deficit, m.remarks || '']);
        exportToCSV('Overall_Members_Summary', headers, rows);
    };

    return (
        <div>
            {/* CSS Print Styles */}
            <style jsx global>{`
                @media print {
                    .layout-topbar,
                    .layout-sidebar,
                    .no-print {
                        display: none !important;
                    }
                    .layout-main-container {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .printable-area {
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                    }
                }
            `}</style>

            {/* Controls Header Bar (Hidden on Print) */}
            <div className="surface-card p-4 shadow-2 border-round-xl mb-4 no-print">
                <div className="flex flex-column lg:flex-row justify-content-between align-items-center gap-3">
                    <div>
                        <h3 className="text-2xl font-bold text-900 m-0">Overall Members Summary Ledger (PDF 2)</h3>
                        <span className="text-600">Select Date-to-Date range from calendar and export/print financial summary</span>
                    </div>

                    <div className="flex flex-wrap gap-2 align-items-center justify-content-end">
                        {/* Date Range Selector */}
                        <div className="flex align-items-center gap-1 bg-surface-100 p-2 border-round-lg border-1 surface-border">
                            <span className="text-600 font-bold text-xs uppercase px-1">From:</span>
                            <InputText type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-9rem p-inputtext-sm" />
                            <span className="text-600 font-bold text-xs uppercase px-1">To:</span>
                            <InputText type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-9rem p-inputtext-sm" />
                            {(fromDate || toDate) && (
                                <Button
                                    icon="pi pi-filter-slash"
                                    tooltip="Clear Date Filter"
                                    className="p-button-outlined p-button-secondary p-button-sm ml-1"
                                    onClick={() => {
                                        setFromDate('');
                                        setToDate('');
                                    }}
                                />
                            )}
                        </div>

                        {/* Action Buttons */}
                        <Button label="Print" icon="pi pi-print" className="p-button-outlined p-button-secondary font-semibold" onClick={handlePrint} />
                        <Button label="Save PDF" icon="pi pi-file-pdf" className="p-button-danger font-semibold" onClick={handlePrint} />
                        <Button label="Save Excel" icon="pi pi-file-excel" className="p-button-success font-semibold" onClick={handleExportExcel} />
                    </div>
                </div>
            </div>

            {/* Printable Report Output Area */}
            <div className="surface-card p-5 shadow-2 border-round-xl printable-area">
                {/* Official PDF Header Banner */}
                <div className="text-center border-bottom-2 surface-border pb-3 mb-4">
                    <h2 className="text-3xl font-bold text-900 m-0" style={{ color: '#1B365D' }}>
                        নবধারা আরিয়ান সোসাইটি
                    </h2>
                    <div className="text-700 font-medium mt-1">আরিয়ান সিটি, বনগাঁও, সাভার, ঢাকা — ১লা জানুয়ারি, ২০২৬ খ্রিস্টাব্দ</div>
                    <div className="text-xl font-bold text-primary mt-2">এক নজরে সামগ্রিক হিসাব (Overall Members Summary Ledger)</div>
                    {(fromDate || toDate) && (
                        <div className="text-primary font-bold text-sm mt-1">
                            Date Range Filter: {fromDate ? formatDate(fromDate) : 'Start'} to {toDate ? formatDate(toDate) : 'Present'}
                        </div>
                    )}
                </div>

                {/* Summary Header Cards */}
                <div className="grid mb-4 text-center">
                    <div className="col-3">
                        <div className="p-3 surface-100 border-round">
                            <span className="text-600 block font-semibold mb-1">Total Deposit</span>
                            <span className="text-xl font-bold text-blue-700">{formatCurrency(totalDeposit)}</span>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="p-3 surface-100 border-round">
                            <span className="text-600 block font-semibold mb-1">Total Shares</span>
                            <span className="text-xl font-bold text-orange-700">{totalShares} Units</span>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="p-3 surface-100 border-round">
                            <span className="text-600 block font-semibold mb-1">Total Expenses Paid</span>
                            <span className="text-xl font-bold text-purple-700">{formatCurrency(totalExpenses)}</span>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="p-3 surface-100 border-round">
                            <span className="text-600 block font-semibold mb-1">Net Balance</span>
                            <span className="text-xl font-bold text-green-700">{formatCurrency(netBalance)}</span>
                        </div>
                    </div>
                </div>

                {/* PDF 2 Data Table */}
                <table className="w-full text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1B365D', color: '#fff', textAlign: 'center' }}>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>SL</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Name</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Mobile No</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Address</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Shares</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Total Deposit</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Total Penalty</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Total Realized</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Surplus / Deficit</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayMembers.map((m) => (
                            <tr key={m.id} style={{ textAlign: 'center' }}>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{m.sl_no}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', textAlign: 'left' }}>{m.name}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{m.mobile}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', textAlign: 'left' }}>{m.address}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{m.share_count}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(m.total_deposit)}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(m.total_penalty)}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(m.total_realized)}</td>
                                <td
                                    style={{
                                        padding: '6px',
                                        border: '1px solid #ccc',
                                        fontWeight: 'bold',
                                        color: m.surplus_deficit >= 0 ? 'green' : 'red'
                                    }}
                                >
                                    {formatCurrency(m.surplus_deficit)}
                                </td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', fontSize: '12px' }}>{m.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default OverallSummaryReport;
