'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Link from 'next/link';
import { formatDate, toTimestamp, toInputDateString, toMonthName } from '@/lib/date';
import { exportToCSV } from '@/lib/export';

interface Member {
    id: number;
    sl_no: number;
    name: string;
    email?: string;
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

const MemberInstallmentsPage = () => {
    const params = useParams();
    const router = useRouter();
    const memberId = params?.id ? String(params.id) : null;

    const [member, setMember] = useState<Member | null>(null);
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    // Member Edit Dialog State
    const [memberDialog, setMemberDialog] = useState(false);
    const [editingMember, setEditingMember] = useState<Partial<Member>>({});

    // Payment Add/Edit Dialog State
    const [paymentDialog, setPaymentDialog] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Partial<Installment>>({
        installment_type: '1st Installment',
        month_name: 'March-2026',
        deposit_date: new Date().toISOString().split('T')[0],
        deposit_amount: 4000,
        penalty_amount: 0,
        remarks: ''
    });

    const toast = useRef<Toast>(null);

    const formatCurrency = (amount: number) => {
        return (
            '৳ ' +
            Number(amount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );
    };

    const checkAdmin = async () => {
        try {
            const res = await fetch('/api/auth/me');
            const data = await res.json();
            if (data.authenticated && data.user?.role === 'admin') {
                setIsAdmin(true);
            }
        } catch {
            setIsAdmin(false);
        }
    };

    const fetchMemberData = async () => {
        if (!memberId) return;
        setLoading(true);
        try {
            // Fetch member list to find member details
            const memRes = await fetch('/api/members');
            const memData = await memRes.json();
            if (memData.success) {
                const found = memData.data.find((m: Member) => String(m.id) === memberId);
                if (found) {
                    setMember(found);
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Member not found' });
                }
            }

            // Fetch member installments
            const instRes = await fetch(`/api/installments?member_id=${memberId}`);
            const instData = await instRes.json();
            if (instData.success) {
                setInstallments(instData.data);
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load member data' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAdmin();
        fetchMemberData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [memberId]);

    const saveMember = async () => {
        if (!editingMember.id || !editingMember.name?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Member name is required' });
            return;
        }

        try {
            const payload = {
                ...editingMember,
                joining_date: toTimestamp(editingMember.joining_date)
            };
            const res = await fetch('/api/members', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Member information updated successfully'
                });
                setMemberDialog(false);
                fetchMemberData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error || 'Failed to update member' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
    };

    const savePayment = async () => {
        if (!memberId || !editingPayment.installment_type) return;

        try {
            const payload = {
                ...editingPayment,
                member_id: Number(memberId),
                month_name: toMonthName(editingPayment.deposit_date),
                deposit_date: toTimestamp(editingPayment.deposit_date)
            };
            const isEdit = !!editingPayment.id;
            const res = await fetch('/api/installments', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: isEdit ? 'Payment updated' : 'Payment added'
                });
                setPaymentDialog(false);
                fetchMemberData();
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to save payment' });
        }
    };

    const deletePayment = (id: number) => {
        confirmDialog({
            message: 'Are you sure you want to delete this payment record? This action cannot be undone.',
            header: 'Delete Installment Payment',
            icon: 'pi pi-exclamation-triangle text-red-500',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Yes, Delete',
            rejectLabel: 'Cancel',
            accept: async () => {
                try {
                    const res = await fetch(`/api/installments?id=${id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Payment deleted' });
                        fetchMemberData();
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
                    }
                } catch {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to delete payment' });
                }
            }
        });
    };

    const exportExcel = () => {
        if (!member) return;
        const headers = ['Installment Type', 'Month Name', 'Deposit Date', 'Deposit Amount (BDT)', 'Penalty Amount (BDT)', 'Remarks'];
        const rows = installments.map((inst) => [inst.installment_type, inst.month_name, formatDate(inst.deposit_date), inst.deposit_amount, inst.penalty_amount, inst.remarks || '']);
        exportToCSV(`Member_Ledger_${member.sl_no}_${member.name}`, headers, rows);
    };

    return (
        <div className="surface-card p-4 shadow-2 border-round-xl">
            {/* CSS Print Styles */}
            <style jsx global>{`
                @media print {
                    .layout-topbar,
                    .layout-sidebar,
                    .no-print,
                    .screen-only-block {
                        display: none !important;
                    }
                    .layout-main-container {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .printable-area {
                        display: block !important;
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

            <Toast ref={toast} position="top-right" />
            <ConfirmDialog />

            {/* Back Button & Top Header (No Print) */}
            <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3 pb-3 border-bottom-1 surface-border no-print">
                <div className="flex align-items-center gap-3">
                    <Link href="/members">
                        <Button icon="pi pi-arrow-left" className="p-button-outlined p-button-secondary" tooltip="Back to Members List" />
                    </Link>
                    <div>
                        <h3 className="text-2xl font-bold text-900 m-0">Member Installments Sheet — {member?.name || 'Loading...'}</h3>
                        <span className="text-600">Individual member installment ledger (PDF 1 Format)</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Button label="Print" icon="pi pi-print" className="p-button-outlined p-button-secondary font-semibold" onClick={() => window.print()} />
                    <Button label="Save PDF" icon="pi pi-file-pdf" className="p-button-danger font-semibold" onClick={() => window.print()} />
                    <Button label="Save Excel" icon="pi pi-file-excel" className="p-button-success font-semibold" onClick={exportExcel} />
                    {isAdmin && member && (
                        <Button
                            label="Edit Member Info"
                            icon="pi pi-user-edit"
                            className="p-button-warning font-semibold"
                            onClick={() => {
                                setEditingMember({ ...member });
                                setMemberDialog(true);
                            }}
                        />
                    )}
                    {isAdmin && (
                        <Button
                            label="Add Installment Payment"
                            icon="pi pi-plus"
                            className="p-button-primary font-semibold"
                            onClick={() => {
                                setEditingPayment({
                                    installment_type: '1st Installment',
                                    month_name: 'March-2026',
                                    deposit_date: new Date().toISOString().split('T')[0],
                                    deposit_amount: 4000,
                                    penalty_amount: 0,
                                    remarks: ''
                                });
                                setPaymentDialog(true);
                            }}
                        />
                    )}
                </div>
            </div>

            {member ? (
                <>
                    {/* Screen View Layout (Hidden on Print) */}
                    <div className="grid screen-only-block">
                        {/* Left Column: Personal Info & Financial Summary Card */}
                        <div className="col-12 lg:col-4 xl:col-3">
                            <div className="surface-card p-4 border-round-xl border-1 surface-border shadow-1">
                                {/* Profile Avatar & Header */}
                                <div className="flex align-items-center justify-content-between pb-3 mb-3 border-bottom-1 surface-border">
                                    <div className="flex align-items-center gap-3 overflow-hidden">
                                        <div className="border-circle bg-blue-500 text-white flex align-items-center justify-content-center text-xl font-bold flex-shrink-0 shadow-2" style={{ width: '52px', height: '52px' }}>
                                            {member.name ? member.name.charAt(0).toUpperCase() : 'M'}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h4 className="text-xl font-bold text-900 m-0 line-height-2 text-ellipsis overflow-hidden whitespace-nowrap">{member.name}</h4>
                                            <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-100 text-blue-800 font-bold border-round text-xs">SL No: #{member.sl_no}</span>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <Button
                                            icon="pi pi-pencil"
                                            className="p-button-rounded p-button-text p-button-warning p-button-sm flex-shrink-0"
                                            tooltip="Edit Member Info"
                                            onClick={() => {
                                                setEditingMember({ ...member });
                                                setMemberDialog(true);
                                            }}
                                        />
                                    )}
                                </div>

                                {/* Contact Details List */}
                                <div className="flex flex-column gap-2 mb-4 pb-3 border-bottom-1 surface-border">
                                    <div className="flex align-items-center gap-2 text-700 text-sm">
                                        <i className="pi pi-phone text-blue-500 text-base" />
                                        <span className="text-500 font-medium">Mobile:</span>
                                        <span className="text-900 font-semibold ml-auto">{member.mobile || 'N/A'}</span>
                                    </div>
                                    <div className="flex align-items-center gap-2 text-700 text-sm">
                                        <i className="pi pi-envelope text-purple-500 text-base" />
                                        <span className="text-500 font-medium">Email:</span>
                                        <span className="text-900 font-semibold ml-auto text-ellipsis overflow-hidden whitespace-nowrap" style={{ maxWidth: '160px' }} title={member.email || 'N/A'}>
                                            {member.email || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex align-items-center gap-2 text-700 text-sm">
                                        <i className="pi pi-calendar text-orange-500 text-base" />
                                        <span className="text-500 font-medium">Joined:</span>
                                        <span className="text-900 font-semibold ml-auto">{formatDate(member.joining_date)}</span>
                                    </div>
                                    <div className="flex align-items-start gap-2 text-700 text-sm">
                                        <i className="pi pi-map-marker text-green-500 text-base mt-1" />
                                        <span className="text-500 font-medium">Address:</span>
                                        <span className="text-900 font-semibold ml-auto text-right">{member.address || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Financial Summary Stat Blocks */}
                                <div className="flex flex-column gap-3">
                                    {/* Share Count & Expected Amount Grid */}
                                    <div className="grid grid-nogutter gap-2">
                                        <div className="col surface-100 p-3 border-round-lg text-center border-1 surface-border">
                                            <span className="text-500 block text-xs font-bold uppercase mb-1">Share Count</span>
                                            <span className="text-xl font-bold text-orange-600">{member.share_count} Units</span>
                                        </div>
                                        <div className="col surface-100 p-3 border-round-lg text-center border-1 surface-border">
                                            <span className="text-500 block text-xs font-bold uppercase mb-1">Expected</span>
                                            <span className="text-base font-bold text-900">{formatCurrency(member.expected_amount)}</span>
                                        </div>
                                    </div>

                                    {/* Total Deposit */}
                                    <div className="p-3 border-round-lg surface-50 border-1 surface-border flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <div className="p-2 border-circle bg-blue-100 text-blue-600 flex align-items-center justify-content-center">
                                                <i className="pi pi-wallet text-sm" />
                                            </div>
                                            <span className="text-700 text-sm font-semibold">Total Deposit</span>
                                        </div>
                                        <strong className="text-base text-blue-600 font-bold">{formatCurrency(member.total_deposit)}</strong>
                                    </div>

                                    {/* Total Penalty */}
                                    <div className="p-3 border-round-lg surface-50 border-1 surface-border flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <div className="p-2 border-circle bg-pink-100 text-pink-600 flex align-items-center justify-content-center">
                                                <i className="pi pi-exclamation-triangle text-sm" />
                                            </div>
                                            <span className="text-700 text-sm font-semibold">Total Penalty</span>
                                        </div>
                                        <strong className="text-base text-pink-600 font-bold">{formatCurrency(member.total_penalty)}</strong>
                                    </div>

                                    {/* Total Realized */}
                                    <div className="p-3 border-round-lg surface-50 border-1 surface-border flex align-items-center justify-content-between">
                                        <div className="flex align-items-center gap-2">
                                            <div className="p-2 border-circle bg-purple-100 text-purple-600 flex align-items-center justify-content-center">
                                                <i className="pi pi-check-circle text-sm" />
                                            </div>
                                            <span className="text-700 text-sm font-semibold">Total Realized</span>
                                        </div>
                                        <strong className="text-base text-purple-600 font-bold">{formatCurrency(member.total_realized)}</strong>
                                    </div>

                                    {/* Surplus / Deficit Card Highlight */}
                                    <div className={`p-3 border-round-lg border-1 ${member.surplus_deficit >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                                        <div className="flex align-items-center justify-content-between mb-1">
                                            <span className={`text-xs font-bold uppercase ${member.surplus_deficit >= 0 ? 'text-green-700' : 'text-red-700'}`}>Surplus / Deficit Status</span>
                                            <i className={`pi ${member.surplus_deficit >= 0 ? 'pi-arrow-up-right text-green-600' : 'pi-arrow-down-right text-red-600'} font-bold`} />
                                        </div>
                                        <div className={`text-2xl font-bold ${member.surplus_deficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(member.surplus_deficit)}</div>
                                    </div>

                                    {member.remarks && (
                                        <div className="p-2.5 border-round-lg bg-yellow-50 border-1 border-yellow-200 text-yellow-900 text-xs">
                                            <strong className="block mb-0.5">Remarks:</strong>
                                            <span>{member.remarks}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Installments Payments Table */}
                        <div className="col-12 lg:col-8 xl:col-9">
                            <div className="surface-card border-round-xl border-1 surface-border p-3">
                                <div className="flex justify-content-between align-items-center mb-3">
                                    <h4 className="text-lg font-bold text-900 m-0">Payment Ledger</h4>
                                    <span className="text-500 text-sm">{installments.length} Records</span>
                                </div>

                                <DataTable value={installments} loading={loading} responsiveLayout="scroll" className="p-datatable-gridlines" emptyMessage="No installment records found.">
                                    <Column field="installment_type" header="Type" style={{ width: '15%' }} />
                                    <Column field="month_name" header="Month" style={{ width: '20%' }} />
                                    <Column field="deposit_date" header="Deposit Date" body={(d) => formatDate(d.deposit_date)} style={{ width: '15%' }} />
                                    <Column field="deposit_amount" header="Deposit Amount" body={(d) => formatCurrency(d.deposit_amount)} style={{ width: '15%' }} />
                                    <Column field="penalty_amount" header="Penalty" body={(d) => formatCurrency(d.penalty_amount)} style={{ width: '10%' }} />
                                    <Column field="remarks" header="Remarks" style={{ width: '15%' }} />
                                    {isAdmin && (
                                        <Column
                                            header="Actions"
                                            style={{ width: '10%' }}
                                            body={(inst: Installment) => (
                                                <div className="flex gap-1">
                                                    <Button
                                                        icon="pi pi-pencil"
                                                        className="p-button-sm p-button-warning p-button-text"
                                                        onClick={() => {
                                                            setEditingPayment(inst);
                                                            setPaymentDialog(true);
                                                        }}
                                                    />
                                                    <Button icon="pi pi-trash" className="p-button-sm p-button-danger p-button-text" onClick={() => deletePayment(inst.id)} />
                                                </div>
                                            )}
                                        />
                                    )}
                                </DataTable>
                            </div>
                        </div>
                    </div>

                    {/* Official PDF 1 Printable Layout (Shown on Print) */}
                    <div className="printable-area hidden">
                        <div className="text-center border-bottom-2 surface-border pb-3 mb-4">
                            <h2 className="text-3xl font-bold text-900 m-0" style={{ color: '#1B365D' }}>
                                নবধারা আরিয়ান সোসাইটি
                            </h2>
                            <div className="text-700 font-medium mt-1">আরিয়ান সিটি, বনগাঁও, সাভার, ঢাকা — ১লা জানুয়ারি, ২০২৬ খ্রিস্টাব্দ</div>
                            <div className="text-xl font-bold text-primary mt-2">১ম পাতা - সদস্য কিস্তি হিসাব ({member.name})</div>
                        </div>

                        <table className="w-full mb-4 text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>SL No:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{member.sl_no}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Name:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{member.name}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Mobile:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{member.mobile}</td>
                                </tr>
                                <tr>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Address:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{member.address}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Shares:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc' }}>{member.share_count}</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Total Deposit:</td>
                                    <td style={{ padding: '8px', border: '1px solid #ccc', color: 'blue', fontWeight: 'bold' }}>{formatCurrency(member.total_deposit)}</td>
                                </tr>
                            </tbody>
                        </table>

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
                                {installments.map((inst) => (
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
                </>
            ) : (
                <div className="p-4 text-center text-600">Loading member ledger details...</div>
            )}

            {/* Member Info Edit Dialog for Admin */}
            <Dialog visible={memberDialog} style={{ width: '450px' }} header="Edit Member Information" modal onHide={() => setMemberDialog(false)}>
                <div className="p-fluid">
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Member Name</label>
                        <InputText value={editingMember.name || ''} onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} placeholder="e.g. John Doe" />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Email Address</label>
                        <InputText type="email" value={editingMember.email || ''} onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })} placeholder="e.g. member@example.com" />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Mobile No</label>
                        <InputText value={editingMember.mobile || ''} onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })} placeholder="e.g. 01920005000" />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Joining Date</label>
                        <InputText type="date" value={toInputDateString(editingMember.joining_date)} onChange={(e) => setEditingMember({ ...editingMember, joining_date: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Address</label>
                        <InputText value={editingMember.address || ''} onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })} placeholder="e.g. Khalishpur, Khulna" />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Share Count</label>
                        <InputNumber value={editingMember.share_count || 1} onValueChange={(e) => setEditingMember({ ...editingMember, share_count: e.value || 1 })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Expected Target Amount (BDT)</label>
                        <InputNumber value={editingMember.expected_amount || 0} onValueChange={(e) => setEditingMember({ ...editingMember, expected_amount: e.value || 0 })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Remarks (e.g. Share Transfer)</label>
                        <InputText value={editingMember.remarks || ''} onChange={(e) => setEditingMember({ ...editingMember, remarks: e.target.value })} />
                    </div>
                    <Button label="Save Member Info" icon="pi pi-check" onClick={saveMember} className="mt-2 p-button-primary" />
                </div>
            </Dialog>

            {/* Payment Add/Edit Dialog */}
            <Dialog visible={paymentDialog} style={{ width: '400px' }} header={editingPayment.id ? 'Edit Installment Record' : 'Add Installment Record'} modal onHide={() => setPaymentDialog(false)}>
                <div className="p-fluid">
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Installment Type (e.g. Lump Sum / 1st Installment)</label>
                        <InputText value={editingPayment.installment_type || ''} onChange={(e) => setEditingPayment({ ...editingPayment, installment_type: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Deposit Date</label>
                        <InputText type="date" value={toInputDateString(editingPayment.deposit_date)} onChange={(e) => setEditingPayment({ ...editingPayment, deposit_date: e.target.value })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Deposit Amount (BDT)</label>
                        <InputNumber value={editingPayment.deposit_amount || 0} onValueChange={(e) => setEditingPayment({ ...editingPayment, deposit_amount: e.value || 0 })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Penalty Amount (BDT)</label>
                        <InputNumber value={editingPayment.penalty_amount || 0} onValueChange={(e) => setEditingPayment({ ...editingPayment, penalty_amount: e.value || 0 })} />
                    </div>
                    <div className="mb-3">
                        <label className="font-semibold block mb-1">Remarks (e.g. Share Transfer Note)</label>
                        <InputText value={editingPayment.remarks || ''} onChange={(e) => setEditingPayment({ ...editingPayment, remarks: e.target.value })} />
                    </div>
                    <Button label="Save Payment" icon="pi pi-check" onClick={savePayment} className="mt-2" />
                </div>
            </Dialog>
        </div>
    );
};

export default MemberInstallmentsPage;
