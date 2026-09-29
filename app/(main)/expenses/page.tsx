'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { Dropdown } from 'primereact/dropdown';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { formatDate, toTimestamp, toInputDateString } from '@/lib/date';

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

const ExpensesPage = () => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);

    // Expense Dialog State
    const [expenseDialog, setExpenseDialog] = useState(false);
    const [editingExpense, setEditingExpense] = useState<Partial<Expense>>({
        sl_no: 1,
        expense_title: '',
        location: '',
        payment_method: 'Check',
        expense_date: new Date().toISOString().split('T')[0],
        amount: 0,
        remarks: ''
    });

    const paymentMethods = [
        { label: 'Check', value: 'Check' },
        { label: 'Cash', value: 'Cash' },
        { label: 'Account Transfer / Other', value: 'Other' }
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
            if (data.success) {
                setExpenses(data.data);
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load expenses' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const totalExpenseAmount = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

    const saveExpense = async () => {
        if (!editingExpense.expense_title?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Expense title is required' });
            return;
        }

        try {
            const isEdit = !!editingExpense.id;
            const payload = {
                ...editingExpense,
                expense_date: toTimestamp(editingExpense.expense_date)
            };
            const res = await fetch('/api/expenses', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: isEdit ? 'Expense updated successfully' : 'Expense recorded successfully'
                });
                setExpenseDialog(false);
                fetchExpenses();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
    };

    const deleteExpense = (expense: Expense) => {
        confirmDialog({
            message: `Are you sure you want to delete "${expense.expense_title}"? This action cannot be undone.`,
            header: 'Delete Expense Confirmation',
            icon: 'pi pi-exclamation-triangle text-red-500',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Yes, Delete',
            rejectLabel: 'Cancel',
            accept: async () => {
                try {
                    const res = await fetch(`/api/expenses?id=${expense.id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Expense deleted' });
                        fetchExpenses();
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
                    }
                } catch {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
                }
            }
        });
    };

    // Null-safe expenses search filtering
    const filteredExpensesList = expenses.filter((exp) => {
        if (!globalFilter || !globalFilter.trim()) return true;
        const query = globalFilter.trim().toLowerCase();
        return (
            String(exp.sl_no || '')
                .toLowerCase()
                .includes(query) ||
            (exp.expense_title ? exp.expense_title.toLowerCase().includes(query) : false) ||
            (exp.location ? exp.location.toLowerCase().includes(query) : false) ||
            (exp.payment_method ? exp.payment_method.toLowerCase().includes(query) : false) ||
            (exp.expense_date ? exp.expense_date.toLowerCase().includes(query) : false) ||
            (exp.remarks ? exp.remarks.toLowerCase().includes(query) : false) ||
            String(exp.amount || '').includes(query)
        );
    });

    return (
        <div className="surface-card p-4 shadow-2 border-round-xl">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Header Banner & Summary */}
            <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h3 className="text-2xl font-bold text-900 m-0">Expense </h3>
                    <span className="text-600">Monthly installments and project expenses breakdown</span>
                </div>
                <div className="surface-100 p-3 border-round-xl text-right">
                    <span className="text-600 block font-semibold">Total Expenses Paid</span>
                    <span className="text-2xl font-bold text-purple-600">{formatCurrency(totalExpenseAmount)}</span>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
                <span className="p-input-icon-left w-full md:w-auto">
                    <i className="pi pi-search" />
                    <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search expense item..." className="w-full md:w-auto" />
                </span>
                <Button
                    label="Add New Expense"
                    icon="pi pi-plus"
                    className="p-button-success font-semibold"
                    onClick={() => {
                        setEditingExpense({
                            sl_no: expenses.length + 1,
                            expense_title: '',
                            location: '',
                            payment_method: 'Check',
                            expense_date: new Date().toISOString().split('T')[0],
                            amount: 0,
                            remarks: ''
                        });
                        setExpenseDialog(true);
                    }}
                />
            </div>

            {/* PDF 3 Table */}
            <DataTable value={filteredExpensesList} loading={loading} paginator rows={15} responsiveLayout="scroll" emptyMessage="No expense records found" className="p-datatable-gridlines">
                <Column field="sl_no" header="SL No" sortable style={{ width: '8%' }} />
                <Column field="expense_title" header="Expense Item" sortable style={{ width: '25%' }} />
                <Column field="location" header="Location" style={{ width: '25%' }} />
                <Column field="payment_method" header="Payment Method" style={{ width: '12%' }} />
                <Column field="expense_date" header="Date" body={(d) => formatDate(d.expense_date)} sortable style={{ width: '12%' }} />
                <Column field="amount" header="Amount" body={(d) => formatCurrency(d.amount)} sortable style={{ width: '12%' }} />
                <Column field="remarks" header="Remarks" style={{ width: '10%' }} />
                <Column
                    header="Actions"
                    style={{ width: '10%' }}
                    body={(expense: Expense) => (
                        <div className="flex gap-1">
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-sm p-button-warning p-button-text"
                                tooltip="Edit Expense"
                                onClick={() => {
                                    setEditingExpense(expense);
                                    setExpenseDialog(true);
                                }}
                            />
                            <Button icon="pi pi-trash" className="p-button-sm p-button-danger p-button-text" tooltip="Delete Expense" onClick={() => deleteExpense(expense)} />
                        </div>
                    )}
                />
            </DataTable>

            {/* Add/Edit Expense Dialog */}
            <Dialog visible={expenseDialog} style={{ width: '450px' }} header={editingExpense.id ? 'Edit Expense Information' : 'Add New Expense'} modal onHide={() => setExpenseDialog(false)}>
                <div className="p-fluid">
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Expense Title / Item</label>
                        <InputText value={editingExpense.expense_title || ''} onChange={(e) => setEditingExpense({ ...editingExpense, expense_title: e.target.value })} placeholder="e.g. Down Payment-1" />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Location / Address</label>
                        <InputText value={editingExpense.location || ''} onChange={(e) => setEditingExpense({ ...editingExpense, location: e.target.value })} placeholder="138/1, Runner Building, Tejgaon, Dhaka" />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Payment Method</label>
                        <Dropdown value={editingExpense.payment_method} options={paymentMethods} onChange={(e) => setEditingExpense({ ...editingExpense, payment_method: e.value })} placeholder="Select Payment Method" />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Date</label>
                        <InputText type="date" value={toInputDateString(editingExpense.expense_date)} onChange={(e) => setEditingExpense({ ...editingExpense, expense_date: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Amount (BDT)</label>
                        <InputNumber value={editingExpense.amount || 0} onValueChange={(e) => setEditingExpense({ ...editingExpense, amount: e.value || 0 })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Remarks</label>
                        <InputText value={editingExpense.remarks || ''} onChange={(e) => setEditingExpense({ ...editingExpense, remarks: e.target.value })} />
                    </div>
                    <Button label="Save Expense" icon="pi pi-check" onClick={saveExpense} className="mt-2" />
                </div>
            </Dialog>
        </div>
    );
};

export default ExpensesPage;
