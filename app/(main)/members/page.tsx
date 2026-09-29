'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { InputNumber } from 'primereact/inputnumber';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import Link from 'next/link';
import { formatDate, toTimestamp, toInputDateString } from '@/lib/date';

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

const MembersPage = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);

    // Member Dialog State
    const [memberDialog, setMemberDialog] = useState(false);
    const [editingMember, setEditingMember] = useState<Partial<Member>>({
        sl_no: 1,
        name: '',
        email: '',
        joining_date: '',
        mobile: '',
        address: '',
        share_count: 1,
        expected_amount: 0,
        remarks: ''
    });

    const formatCurrency = (amount: number) => {
        return (
            '৳ ' +
            Number(amount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );
    };

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/members');
            const data = await res.json();
            if (data.success) {
                setMembers(data.data);
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to load members' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMembers();
    }, []);

    // Member Save
    const saveMember = async () => {
        if (!editingMember.name?.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Member name is required' });
            return;
        }

        try {
            const isEdit = !!editingMember.id;
            const payload = {
                ...editingMember,
                joining_date: toTimestamp(editingMember.joining_date)
            };
            const res = await fetch('/api/members', {
                method: isEdit ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();

            if (data.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: isEdit ? 'Member updated successfully' : 'Member created successfully'
                });
                setMemberDialog(false);
                fetchMembers();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Save failed' });
        }
    };

    // Member Delete
    const deleteMember = (member: Member) => {
        confirmDialog({
            message: `Are you sure you want to delete member "${member.name}"? This action cannot be undone.`,
            header: 'Delete Member Confirmation',
            icon: 'pi pi-exclamation-triangle text-red-500',
            acceptClassName: 'p-button-danger',
            acceptLabel: 'Yes, Delete',
            rejectLabel: 'Cancel',
            accept: async () => {
                try {
                    const res = await fetch(`/api/members?id=${member.id}`, { method: 'DELETE' });
                    const data = await res.json();
                    if (data.success) {
                        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Member deleted' });
                        fetchMembers();
                    } else {
                        toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
                    }
                } catch {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Delete failed' });
                }
            }
        });
    };

    // Null-safe member search filtering
    const filteredMembers = members.filter((m) => {
        if (!globalFilter || !globalFilter.trim()) return true;
        const query = globalFilter.trim().toLowerCase();
        return (
            String(m.sl_no || '')
                .toLowerCase()
                .includes(query) ||
            (m.name ? m.name.toLowerCase().includes(query) : false) ||
            (m.mobile ? m.mobile.toLowerCase().includes(query) : false) ||
            (m.email ? m.email.toLowerCase().includes(query) : false) ||
            (m.address ? m.address.toLowerCase().includes(query) : false) ||
            (m.remarks ? m.remarks.toLowerCase().includes(query) : false) ||
            String(m.total_deposit || '').includes(query) ||
            String(m.total_realized || '').includes(query)
        );
    });

    return (
        <div className="surface-card p-4 shadow-2 border-round-xl">
            <Toast ref={toast} />
            <ConfirmDialog />

            {/* Header & Controls */}
            <div className="flex flex-column md:flex-row justify-content-between align-items-center mb-4 gap-3">
                <div>
                    <h3 className="text-2xl font-bold text-900 m-0">Members Ledger</h3>
                    <span className="text-600">Comprehensive breakdown of member shares, deposits, penalties, and surplus/deficit</span>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <span className="p-input-icon-left w-full md:w-auto">
                        <i className="pi pi-search" />
                        <InputText type="search" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Search member..." className="w-full md:w-auto" />
                    </span>
                    <Button
                        label="Add New Member"
                        icon="pi pi-user-plus"
                        className="p-button-primary font-semibold"
                        onClick={() => {
                            setEditingMember({
                                sl_no: members.length + 1,
                                name: '',
                                email: '',
                                joining_date: '',
                                mobile: '',
                                address: '',
                                share_count: 1,
                                expected_amount: 0,
                                remarks: ''
                            });
                            setMemberDialog(true);
                        }}
                    />
                </div>
            </div>

            {/* PDF 2 Table */}
            <DataTable value={filteredMembers} loading={loading} paginator rows={15} responsiveLayout="scroll" emptyMessage="No members found" className="p-datatable-gridlines">
                <Column field="sl_no" header="SL No" sortable style={{ width: '5%' }} />
                <Column
                    field="name"
                    header="Name"
                    sortable
                    style={{ width: '15%' }}
                    body={(member: Member) => (
                        <Link href={`/members/${member.id}`} className="font-bold text-primary hover:underline flex align-items-center gap-1" title="Click to view full installment ledger page">
                            <i className="pi pi-user text-xs" />
                            {member.name}
                        </Link>
                    )}
                />
                <Column field="mobile" header="Mobile No" style={{ width: '12%' }} />
                <Column field="email" header="Email Address" style={{ width: '15%' }} body={(m) => m.email || 'N/A'} />
                <Column field="address" header="Address" style={{ width: '15%' }} />
                <Column field="share_count" header="Shares" sortable style={{ width: '8%' }} className="text-center" />
                <Column field="total_deposit" header="Total Deposit" body={(d) => formatCurrency(d.total_deposit)} sortable style={{ width: '10%' }} />
                <Column field="total_penalty" header="Total Penalty" body={(d) => formatCurrency(d.total_penalty)} sortable style={{ width: '10%' }} />
                <Column field="total_realized" header="Total Realized" body={(d) => formatCurrency(d.total_realized)} sortable style={{ width: '10%' }} />
                <Column
                    field="surplus_deficit"
                    header="Surplus / Deficit"
                    body={(d) => <span className={`font-bold ${d.surplus_deficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(d.surplus_deficit)}</span>}
                    sortable
                    style={{ width: '10%' }}
                />
                <Column field="remarks" header="Remarks" style={{ width: '10%' }} />
                <Column
                    header="Actions"
                    style={{ width: '12%' }}
                    body={(member: Member) => (
                        <div className="flex gap-1">
                            <Link href={`/members/${member.id}`}>
                                <Button icon="pi pi-file" className="p-button-sm p-button-info p-button-text" tooltip="View Installment Ledger Page" />
                            </Link>
                            <Button
                                icon="pi pi-pencil"
                                className="p-button-sm p-button-warning p-button-text"
                                tooltip="Edit Member"
                                onClick={() => {
                                    setEditingMember(member);
                                    setMemberDialog(true);
                                }}
                            />
                            <Button icon="pi pi-trash" className="p-button-sm p-button-danger p-button-text" tooltip="Delete Member" onClick={() => deleteMember(member)} />
                        </div>
                    )}
                />
            </DataTable>

            {/* Member Add/Edit Dialog */}
            <Dialog visible={memberDialog} style={{ width: '450px' }} header={editingMember.id ? 'Edit Member Information' : 'Add New Member'} modal onHide={() => setMemberDialog(false)}>
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
                    <Button label="Save Member" icon="pi pi-check" onClick={saveMember} className="mt-2" />
                </div>
            </Dialog>
        </div>
    );
};

export default MembersPage;
