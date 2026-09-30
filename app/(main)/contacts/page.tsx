'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

interface ContactItem {
    id: number;
    name: string;
    email: string;
    phone: string;
    subject?: string;
    message: string;
    status: 'unread' | 'read' | 'responded';
    created_at: string;
}

export default function ContactsPage() {
    const [data, setData] = useState<ContactItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ContactItem | null>(null);
    const toast = useRef<Toast>(null);

    const statusOptions = [
        { label: 'Unread', value: 'unread', severity: 'danger' },
        { label: 'Read', value: 'read', severity: 'info' },
        { label: 'Responded', value: 'responded', severity: 'success' }
    ];

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/contacts', { cache: 'no-store' });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setData(json.data);
            } else {
                setData([]);
            }
        } catch {
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id: number, status: string, showToast = true) => {
        try {
            const res = await fetch('/api/contacts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            const json = await res.json();
            if (json.success) {
                setData((prev) => prev.map((item) => (item.id === id ? { ...item, status: status as any } : item)));
                if (selectedItem && selectedItem.id === id) {
                    setSelectedItem((prev) => (prev ? { ...prev, status: status as any } : null));
                }
                if (showToast) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Status Updated',
                        detail: `Marked as ${status.toUpperCase()}`,
                        life: 2500
                    });
                }
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Error',
                    detail: json.error || 'Failed to update status',
                    life: 3000
                });
            }
        } catch {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Network error updating status',
                life: 3000
            });
        }
    };

    const viewItem = (item: ContactItem) => {
        setSelectedItem(item);
        // Automatically mark as read if it was unread
        if (item.status === 'unread') {
            updateStatus(item.id, 'read', false);
        }
        setViewDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this contact message?')) return;
        try {
            const res = await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Message removed' });
                setData((prev) => prev.filter((item) => item.id !== id));
                if (selectedItem?.id === id) {
                    setViewDialogOpen(false);
                }
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const statusValueTemplate = (option: any) => {
        if (!option) return null;
        return <Tag severity={option.severity} value={option.label} className="text-xs uppercase px-2 py-1" />;
    };

    const statusItemTemplate = (option: any) => {
        return (
            <div className="flex align-items-center gap-2 py-1">
                <Tag severity={option.severity} value={option.label} className="text-xs uppercase" />
            </div>
        );
    };

    const statusBodyTemplate = (row: ContactItem) => {
        const currentOption = statusOptions.find((o) => o.value === (row.status || 'unread')) || statusOptions[0];
        return (
            <Dropdown
                value={currentOption.value}
                options={statusOptions}
                onChange={(e) => updateStatus(row.id, e.value)}
                valueTemplate={statusValueTemplate(currentOption)}
                itemTemplate={statusItemTemplate}
                className="w-full text-xs p-inputtext-sm border-round-lg"
            />
        );
    };

    const senderBodyTemplate = (row: ContactItem) => {
        return (
            <div className="flex align-items-center gap-2">
                <div className="surface-200 border-circle flex align-items-center justify-content-center flex-shrink-0" style={{ width: '38px', height: '38px' }}>
                    <i className="pi pi-user text-primary font-bold" />
                </div>
                <div className="overflow-hidden">
                    <span className="font-bold text-900 block white-space-nowrap overflow-hidden text-overflow-ellipsis">{row.name}</span>
                    <span className="text-xs text-500 font-mono block">
                        {row.created_at
                            ? new Date(row.created_at).toLocaleDateString(undefined, {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                              })
                            : '-'}
                    </span>
                </div>
            </div>
        );
    };

    const contactInfoTemplate = (row: ContactItem) => {
        return (
            <div className="flex flex-column gap-1 text-sm">
                <a href={`mailto:${row.email}`} className="text-primary hover:underline flex align-items-center gap-1 font-semibold text-overflow-ellipsis overflow-hidden">
                    <i className="pi pi-envelope text-xs" />
                    <span className="overflow-hidden text-overflow-ellipsis">{row.email}</span>
                </a>
                {row.phone ? (
                    <a href={`tel:${row.phone}`} className="text-600 hover:underline flex align-items-center gap-1 text-xs font-mono">
                        <i className="pi pi-phone text-xs" />
                        <span>{row.phone}</span>
                    </a>
                ) : (
                    <span className="text-400 italic text-xs">No phone provided</span>
                )}
            </div>
        );
    };

    const messageBodyTemplate = (row: ContactItem) => {
        return (
            <div className="cursor-pointer" onClick={() => viewItem(row)} title="Click to view full message">
                <p className="text-sm text-700 m-0 line-height-3 text-overflow-ellipsis overflow-hidden" style={{ maxHeight: '48px' }}>
                    {row.message}
                </p>
            </div>
        );
    };

    const actionBody = (row: ContactItem) => (
        <div className="flex gap-1 justify-content-center">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => viewItem(row)} tooltip="View Full Message" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete" />
        </div>
    );

    const unreadCount = data.filter((d) => d.status === 'unread').length;

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex flex-column md:flex-row justify-content-between md:align-items-center mb-4 gap-3">
                <div>
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-envelope text-primary text-2xl" />
                        <h3 className="m-0 font-bold text-900">Contact Inquiries & Messages</h3>
                        {unreadCount > 0 && <Tag severity="danger" value={`${unreadCount} Unread`} className="font-bold ml-2" />}
                    </div>
                    <p className="text-600 m-0 mt-1">Review submissions from website visitors and update their inquiry status</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} loading={loading} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No contact messages found.">
                <Column header="Sender" body={senderBodyTemplate} style={{ width: '22%' }} />
                <Column header="Contact Info" body={contactInfoTemplate} style={{ width: '24%' }} />
                <Column header="Your Message" body={messageBodyTemplate} style={{ width: '32%' }} />
                <Column field="status" header="Status Update" body={statusBodyTemplate} style={{ width: '14%' }} />
                <Column body={actionBody} header="Action" style={{ width: '8%', textAlign: 'center' }} />
            </DataTable>

            {/* VIEW MODAL WITH STATUS UPDATE BUTTONS */}
            <Dialog
                visible={viewDialogOpen}
                style={{ width: '600px', maxWidth: '95vw' }}
                header="Contact Submission Details"
                modal
                className="p-fluid"
                footer={
                    <div className="flex justify-content-between align-items-center w-full">
                        <Button
                            label="Delete"
                            icon="pi pi-trash"
                            severity="danger"
                            text
                            onClick={() => {
                                if (selectedItem) deleteItem(selectedItem.id);
                            }}
                        />
                        <Button label="Close" icon="pi pi-times" onClick={() => setViewDialogOpen(false)} />
                    </div>
                }
                onHide={() => setViewDialogOpen(false)}
            >
                {selectedItem && (
                    <div className="flex flex-column gap-3 pt-2">
                        {/* Status update switcher bar inside view dialog */}
                        <div className="p-3 border-round surface-100 flex flex-column sm:flex-row justify-content-between align-items-start sm:align-items-center gap-2">
                            <span className="text-xs font-bold text-700 uppercase">Change Status:</span>
                            <div className="flex gap-2">
                                <Button label="Unread" size="small" severity="danger" outlined={selectedItem.status !== 'unread'} icon="pi pi-envelope" onClick={() => updateStatus(selectedItem.id, 'unread')} />
                                <Button label="Read" size="small" severity="info" outlined={selectedItem.status !== 'read'} icon="pi pi-eye" onClick={() => updateStatus(selectedItem.id, 'read')} />
                                <Button label="Responded" size="small" severity="success" outlined={selectedItem.status !== 'responded'} icon="pi pi-check" onClick={() => updateStatus(selectedItem.id, 'responded')} />
                            </div>
                        </div>

                        <div className="surface-50 border-1 surface-border border-round p-3">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <span className="text-xs text-500 font-semibold block uppercase">Sender Name</span>
                                    <span className="text-base font-bold text-900">{selectedItem.name}</span>
                                </div>
                                <div className="col-12 md:col-6">
                                    <span className="text-xs text-500 font-semibold block uppercase">Email</span>
                                    <a href={`mailto:${selectedItem.email}`} className="text-base text-primary font-bold hover:underline">
                                        {selectedItem.email}
                                    </a>
                                </div>
                                <div className="col-12 md:col-6">
                                    <span className="text-xs text-500 font-semibold block uppercase">Phone</span>
                                    <span className="text-base font-bold font-mono text-900">{selectedItem.phone || 'N/A'}</span>
                                </div>
                                <div className="col-12 md:col-6">
                                    <span className="text-xs text-500 font-semibold block uppercase">Submitted Date</span>
                                    <span className="text-sm font-medium text-700">{selectedItem.created_at ? new Date(selectedItem.created_at).toLocaleString() : '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="font-bold block mb-1 text-900">Message Content</label>
                            <div className="surface-100 border-round p-3 text-700 line-height-3 whitespace-pre-wrap font-medium">{selectedItem.message}</div>
                        </div>

                        <div className="flex gap-2 mt-2">
                            <a
                                href={`mailto:${selectedItem.email}?subject=Re: Website Inquiry&body=Hi ${selectedItem.name},%0D%0A%0D%0AThank you for reaching out!`}
                                className="p-button p-button-primary p-button-sm flex align-items-center gap-2 no-underline"
                            >
                                <i className="pi pi-reply" />
                                <span>Reply via Email</span>
                            </a>
                            {selectedItem.phone && (
                                <a href={`tel:${selectedItem.phone}`} className="p-button p-button-outlined p-button-secondary p-button-sm flex align-items-center gap-2 no-underline">
                                    <i className="pi pi-phone" />
                                    <span>Call Phone</span>
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
