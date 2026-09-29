'use client';

import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { TabView, TabPanel } from 'primereact/tabview';
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

const ReportsPage = () => {
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [selectedMonth, setSelectedMonth] = useState('All');
    const [members, setMembers] = useState<Member[]>([]);
    const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [summary, setSummary] = useState<any>({});
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

    const [allInstallments, setAllInstallments] = useState<Installment[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [sumRes, memRes, instRes, expRes] = await Promise.all([fetch('/api/summary'), fetch('/api/members'), fetch('/api/installments'), fetch('/api/expenses')]);

            const sumData = await sumRes.json();
            const memData = await memRes.json();
            const instData = await instRes.json();
            const expData = await expRes.json();

            if (sumData.success) setSummary(sumData.data);
            if (memData.success) {
                setMembers(memData.data);
                if (memData.data.length > 0 && !selectedMemberId) {
                    setSelectedMemberId(memData.data[0].id);
                }
            }
            if (instData.success) setAllInstallments(instData.data);
            if (expData.success) setExpenses(expData.data);
        } catch (err) {
            console.error('Failed to load report data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMemberInstallments = async (memberId: number) => {
        try {
            const res = await fetch(`/api/installments?member_id=${memberId}`);
            const data = await res.json();
            if (data.success) setInstallments(data.data);
        } catch (err) {
            console.error('Failed to load installments:', err);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (selectedMemberId) {
            fetchMemberInstallments(selectedMemberId);
        }
    }, [selectedMemberId]);

    const handlePrint = () => {
        window.print();
    };

    const handleExportExcel = () => {
        if (activeTab === 0) {
            const headers = ['SL', 'Name', 'Mobile No', 'Address', 'Shares', 'Total Deposit (BDT)', 'Total Penalty (BDT)', 'Total Realized (BDT)', 'Surplus / Deficit (BDT)', 'Remarks'];
            const rows = members.map((m) => [m.sl_no, m.name, m.mobile || '', m.address || '', m.share_count, m.total_deposit, m.total_penalty, m.total_realized, m.surplus_deficit, m.remarks || '']);
            exportToCSV('Overall_Members_Summary', headers, rows);
        } else if (activeTab === 1 && selectedMemberObj) {
            const headers = ['Installment Type', 'Month Name', 'Deposit Date', 'Deposit Amount (BDT)', 'Penalty Amount (BDT)', 'Remarks'];
            const rows = filteredInstallments.map((inst) => [inst.installment_type, inst.month_name, formatDate(inst.deposit_date), inst.deposit_amount, inst.penalty_amount, inst.remarks || '']);
            exportToCSV(`Member_Sheet_${selectedMemberObj.sl_no}_${selectedMemberObj.name}`, headers, rows);
        } else if (activeTab === 2) {
            const headers = ['SL No', 'Expense Item', 'Location', 'Payment Method', 'Date', 'Amount (BDT)', 'Remarks'];
            const rows = filteredExpenses.map((exp) => [exp.sl_no, exp.expense_title, exp.location || '', exp.payment_method, formatDate(exp.expense_date), exp.amount, exp.remarks || '']);
            exportToCSV('Monthly_Expenses_Ledger', headers, rows);
        }
    };

    // Safe month string extractor
    const getMonthNum = (dateVal?: string) => {
        if (!dateVal) return '';
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return '';
        return String(d.getMonth() + 1).padStart(2, '0');
    };

    // Filter installments by date range
    const filteredInstallments = installments.filter((inst) => isDateInRange(inst.deposit_date, fromDate, toDate));

    // Filter expenses by selected date range and month
    const filteredExpenses = expenses.filter((exp) => {
        if (!isDateInRange(exp.expense_date, fromDate, toDate)) return false;
        if (selectedMonth !== 'All' && exp.expense_date) {
            if (getMonthNum(exp.expense_date) !== selectedMonth) return false;
        }
        return true;
    });

    const filteredAllInstallments = allInstallments.filter((inst) => isDateInRange(inst.deposit_date, fromDate, toDate));

    const displayMembers: Member[] = members.map((m) => {
        if (!fromDate && !toDate) return m;
        const mInsts = filteredAllInstallments.filter((i) => Number(i.member_id) === m.id);
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

    const displayDeposit = fromDate || toDate ? displayMembers.reduce((sum, m) => sum + m.total_deposit, 0) : summary.totalDeposit;
    const displayExpenses = fromDate || toDate ? filteredExpenses.reduce((sum, e) => sum + Number(e.amount || 0), 0) : summary.totalExpenses;
    const displayRealized = fromDate || toDate ? displayMembers.reduce((sum, m) => sum + m.total_realized, 0) : summary.totalDeposit || 0;
    const displayNetBalance = fromDate || toDate ? displayRealized - displayExpenses : summary.netBalance;

    const selectedMemberObj = members.find((m) => m.id === selectedMemberId);

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
                    .-area {
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

            {/* Top Control Bar (Hidden on Print) */}
            <div className="surface-card p-4 shadow-2 border-round-xl mb-4 no-print">
                <div className="flex flex-column lg:flex-row justify-content-between align-items-center gap-3">
                    <div>
                        <h3 className="text-2xl font-bold text-900 m-0"> PDF Reports</h3>
                        <span className="text-600">Select date range or month, report format, and print/save</span>
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

                        {activeTab === 2 && <Dropdown value={selectedMonth} options={monthsList} onChange={(e) => setSelectedMonth(e.value)} placeholder="Select Month" className="w-14rem" />}

                        <Button label="Print" icon="pi pi-print" className="p-button-outlined p-button-secondary font-semibold" onClick={handlePrint} />
                        <Button label="Save PDF" icon="pi pi-file-pdf" className="p-button-danger font-semibold" onClick={handlePrint} />
                        <Button label="Save Excel" icon="pi pi-file-excel" className="p-button-success font-semibold" onClick={handleExportExcel} />
                    </div>
                </div>
            </div>

            {/* Main Tabs (Hidden on Print controls) */}
            <div className="no-print mb-3">
                <TabView activeIndex={activeTab} onTabChange={(e) => setActiveTab(e.index)}>
                    <TabPanel header="PDF 2 Format: Overall Members Summary (এক নজরে সামগ্রিক হিসাব)" />
                    <TabPanel header="PDF 1 Format: Individual Member Sheet (সদস্য কিস্তি হিসাব)" />
                    <TabPanel header="PDF 3 Format: Monthly Expenses (মাসিক কিস্তি ও খরচের হিসাব)" />
                </TabView>
            </div>

            {/*  Report Output Area */}
            <div className="surface-card p-5 shadow-2 border-round-xl -area">
                {/* Official PDF Header Banner */}
                <div className="text-center border-bottom-2 surface-border pb-3 mb-4">
                    <h2 className="text-3xl font-bold text-900 m-0" style={{ color: '#1B365D' }}>
                        নবধারা আরিয়ান সোসাইটি
                    </h2>
                    <div className="text-700 font-medium mt-1">আরিয়ান সিটি, বনগাঁও, সাভার, ঢাকা — ১লা জানুয়ারি, ২০২৬ খ্রিস্টাব্দ</div>
                    <div className="text-xl font-bold text-primary mt-2">
                        {activeTab === 0 && 'এক নজরে সামগ্রিক হিসাব (Overall Members Summary )'}
                        {activeTab === 1 && `১ম পাতা - সদস্য কিস্তি হিসাব (${selectedMemberObj?.name || 'Member'})`}
                        {activeTab === 2 && 'মাসিক কিস্তি ও খরচের হিসাব (Monthly Expense )'}
                    </div>
                    {(fromDate || toDate) && (
                        <div className="text-primary font-bold text-sm mt-1">
                            Date Range Filter: {fromDate ? formatDate(fromDate) : 'Start'} to {toDate ? formatDate(toDate) : 'Present'}
                        </div>
                    )}
                </div>

                {/* TAB 0: PDF 2 FORMAT (Overall Members Summary) */}
                {activeTab === 0 && (
                    <div>
                        {/* Summary Header Cards */}
                        <div className="grid mb-4 text-center">
                            <div className="col-3">
                                <div className="p-3 surface-100 border-round">
                                    <span className="text-600 block font-semibold mb-1">Total Deposit</span>
                                    <span className="text-xl font-bold text-blue-700">{formatCurrency(displayDeposit)}</span>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="p-3 surface-100 border-round">
                                    <span className="text-600 block font-semibold mb-1">Total Shares</span>
                                    <span className="text-xl font-bold text-orange-700">{summary.totalShares} Units</span>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="p-3 surface-100 border-round">
                                    <span className="text-600 block font-semibold mb-1">Total Expenses Paid</span>
                                    <span className="text-xl font-bold text-purple-700">{formatCurrency(displayExpenses)}</span>
                                </div>
                            </div>
                            <div className="col-3">
                                <div className="p-3 surface-100 border-round">
                                    <span className="text-600 block font-semibold mb-1">Net Balance</span>
                                    <span className="text-xl font-bold text-green-700">{formatCurrency(displayNetBalance)}</span>
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
                )}

                {/* TAB 1: PDF 1 FORMAT (Individual Member Sheet) */}
                {activeTab === 1 && (
                    <div>
                        {/* Member Select Dropdown (Hidden on Print) */}
                        <div className="no-print mb-4">
                            <label className="font-semibold block mb-2">Select Member to View PDF 1 Sheet:</label>
                            <Dropdown value={selectedMemberId} options={members.map((m) => ({ label: `${m.sl_no}. ${m.name} (${m.mobile})`, value: m.id }))} onChange={(e) => setSelectedMemberId(e.value)} className="w-full md:w-20rem" />
                        </div>

                        {selectedMemberObj && (
                            <div>
                                {/* Member Header Block */}
                                <table className="w-full mb-4 text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                                    <tbody>
                                        <tr>
                                            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>SL No:</td>
                                            <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedMemberObj.sl_no}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Name:</td>
                                            <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedMemberObj.name}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Mobile:</td>
                                            <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedMemberObj.mobile}</td>
                                        </tr>
                                        <tr>
                                            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Address:</td>
                                            <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedMemberObj.address}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Shares:</td>
                                            <td style={{ padding: '8px', border: '1px solid #ccc' }}>{selectedMemberObj.share_count}</td>
                                            <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Total Deposit:</td>
                                            <td style={{ padding: '8px', border: '1px solid #ccc', color: 'blue', fontWeight: 'bold' }}>{formatCurrency(selectedMemberObj.total_deposit)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                {/* PDF 1 Installment Table */}
                                <table className="w-full text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#1B365D', color: '#fff', textAlign: 'center' }}>
                                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Type</th>
                                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Month</th>
                                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Deposit Date</th>
                                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Deposit Amount</th>
                                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Penalty</th>
                                            <th style={{ padding: '8px', border: '1px solid #ccc' }}>Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredInstallments.map((inst) => (
                                            <tr key={inst.id} style={{ textAlign: 'center' }}>
                                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{inst.installment_type}</td>
                                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{inst.month_name}</td>
                                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatDate(inst.deposit_date)}</td>
                                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(inst.deposit_amount)}</td>
                                                <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(inst.penalty_amount)}</td>
                                                <td style={{ padding: '6px', border: '1px solid #ccc', fontSize: '12px' }}>{inst.remarks}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: PDF 3 FORMAT (Monthly Expense ) */}
                {activeTab === 2 && (
                    <div>
                        <div className="mb-3 font-semibold text-600">Month Filter: {monthsList.find((m) => m.value === selectedMonth)?.label}</div>

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
                )}
            </div>
        </div>
    );
};

export default ReportsPage;
