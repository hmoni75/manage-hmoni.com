'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { formatDate, isDateInRange } from '@/lib/date';
import { exportToCSV } from '@/lib/export';

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

const MonthlyExpensesReport = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);

    const monthsList = [
        { label: 'All Months (সকল মাস)', value: 'All' },
        { label: 'January 2026 (জানুয়ারি-২০২৬)', value: '01' },
        { label: 'February 2026 (ফেব্রুয়ারি-২০২৬)', value: '02' },
        { label: 'March 2026 (মার্চ-২০২৬)', value: '03' },
        { label: 'April 2026 (এপ্রিল-২০২৬)', value: '04' },
        { label: 'May 2026 (মে-২০২৬)', value: '05' },
        { label: 'June 2026 (জুন-২০২৬)', value: '06' },
        { label: 'July 2026 (জুলাই-২০২৬)', value: '07' },
        { label: 'August 2026 (আগস্ট-২০২৬)', value: '08' },
        { label: 'September 2026 (সেপ্টেম্বর-২০২৬)', value: '09' },
        { label: 'October 2026 (অক্টোবর-২০২৬)', value: '10' },
        { label: 'November 2026 (নভেম্বর-২০২৬)', value: '11' },
        { label: 'December 2026 (ডিসেম্বর-২০২৬)', value: '12' }
    ];

    const formatCurrency = (amount: number) => {
        return (
            '৳ ' +
            Number(amount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );
    };

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/expenses');
            const data = await res.json();
            if (data.success) setExpenses(data.data);
        } catch (err) {
            console.error('Failed to load expenses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        const headers = ['SL No', 'Expense Item', 'Location', 'Payment Method', 'Date', 'Amount (BDT)', 'Remarks'];
        const rows = filteredExpenses.map((exp) => [exp.sl_no, exp.expense_title, exp.location || '', exp.payment_method, formatDate(exp.expense_date), exp.amount, exp.remarks || '']);
        exportToCSV('Monthly_Expenses_Ledger', headers, rows);
    };

    const getMonthNum = (dateVal?: string) => {
        if (!dateVal) return '';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '';
        return String(d.getMonth() + 1).padStart(2, '0');
    };

    // Filter expenses by selected date range and month
    const filteredExpenses = expenses.filter((exp) => {
        if (!isDateInRange(exp.expense_date, fromDate, toDate)) return false;
        if (selectedMonth !== 'All' && exp.expense_date) {
            if (getMonthNum(exp.expense_date) !== selectedMonth) return false;
        }
        return true;
    });

    const totalFilteredAmount = filteredExpenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

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

            {/* Controls (Hidden on Print) */}
            <div className="surface-card p-4 shadow-2 border-round-xl mb-4 no-print">
                <div className="flex flex-column lg:flex-row justify-content-between align-items-center gap-3">
                    <div>
                        <h3 className="text-2xl font-bold text-900 m-0">Monthly Expenses Ledger (PDF 3)</h3>
                        <span className="text-600">Printable expense breakdown with calendar date filter</span>
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

                        <Dropdown value={selectedMonth} options={monthsList} onChange={(e) => setSelectedMonth(e.value)} placeholder="Select Month" className="w-14rem" />

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
                    <div className="text-xl font-bold text-primary mt-2">মাসিক কিস্তি ও খরচের হিসাব (Monthly Expense Ledger)</div>
                    {(fromDate || toDate) && (
                        <div className="text-primary font-bold text-sm mt-1">
                            Date Range Filter: {fromDate ? formatDate(fromDate) : 'Start'} to {toDate ? formatDate(toDate) : 'Present'}
                        </div>
                    )}
                </div>

                <div className="flex justify-content-between align-items-center mb-4">
                    <div className="font-semibold text-700">Month Filter: {monthsList.find((m) => m.value === selectedMonth)?.label}</div>
                    <div className="text-lg font-bold text-purple-700">Total Expenses: {formatCurrency(totalFilteredAmount)}</div>
                </div>

                <table className="w-full text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#1B365D', color: '#fff', textAlign: 'center' }}>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>SL No</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Expense Item / Title</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Location / Address</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Payment Method</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Date</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Amount</th>
                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Remarks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredExpenses.map((exp) => (
                            <tr key={exp.id} style={{ textAlign: 'center' }}>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{exp.sl_no}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', textAlign: 'left' }}>{exp.expense_title}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', textAlign: 'left' }}>{exp.location}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{exp.payment_method}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatDate(exp.expense_date)}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc', fontWeight: 'bold' }}>{formatCurrency(exp.amount)}</td>
                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{exp.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MonthlyExpensesReport;
