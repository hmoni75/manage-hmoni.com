'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

export default function ContactsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    const statusOptions = [
        { label: 'Unread', value: 'unread' },
        { label: 'Read', value: 'read' },
        { label: 'Responded', value: 'responded' }
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

    const openNew = () => {
        setSelectedItem(null);
        setFormData({
            name: '',
            email: '',
            phone: '',
            message: '',
            status: 'unread'
        });
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setSelectedItem(item);
        setFormData({ ...item });
        setDialogOpen(true);
    };

    const viewItem = (item: any) => {
        setSelectedItem(item);
        // Automatically mark as read if it was unread
        if (item.status === 'unread' || item.status === 'new') {
            updateStatus(item.id, 'read');
        }
        setViewDialogOpen(true);
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await fetch('/api/contacts', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            setData((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
        } catch {
            // silent fail for auto-read
        }
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this contact message?')) return;
        try {
            const res = await fetch(`/api/contacts?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Message deleted' });
                fetchData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const saveItem = async () => {
        if (!formData.name || !formData.name.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Your name is required' });
            return;
        }

        if (!formData.email || !formData.email.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Your email is required' });
            return;
        }

        if (!formData.message || !formData.message.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Your message is required' });
            return;
        }

        const method = selectedItem ? 'PUT' : 'POST';
        const payload = {
            ...formData,
            id: selectedItem ? selectedItem.id : undefined
        };

        try {
            const res = await fetch('/api/contacts', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Contact inquiry saved' });
                setDialogOpen(false);
                fetchData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const statusBodyTemplate = (row: any) => {
        const s = (row.status || 'unread').toLowerCase();
        if (s === 'unread' || s === 'new') {
            return <Tag severity="danger" value="Unread" className="text-xs uppercase" />;
        }
        if (s === 'responded' || s === 'replied') {
            return <Tag severity="success" value="Responded" className="text-xs uppercase" />;
        }
        return <Tag severity="info" value="Read" className="text-xs uppercase" />;
    };

    const senderBodyTemplate = (row: any) => {
        return (
            <div className="flex align-items-center gap-2">
                <div className="surface-200 border-circle flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                    <i className="pi pi-user text-primary font-bold" />
                </div>
                <div>
                    <span className="font-bold text-900 block">{row.name}</span>
                    <span className="text-xs text-500 font-mono">{row.created_at ? new Date(row.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</span>
                </div>
            </div>
        );
    };

    const contactInfoTemplate = (row: any) => {
        return (
            <div className="flex flex-column gap-1 text-sm">
                <a href={`mailto:${row.email}`} className="text-primary hover:underline flex align-items-center gap-1 font-semibold">
                    <i className="pi pi-envelope text-xs" />
                    <span>{row.email}</span>
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

    const messageBodyTemplate = (row: any) => {
        return (
            <div className="cursor-pointer" onClick={() => viewItem(row)} title="Click to view full message">
                <p className="text-sm text-700 m-0 line-height-3 text-overflow-ellipsis overflow-hidden" style={{ maxHeight: '48px' }}>
                    {row.message}
                </p>
            </div>
        );
    };

    const actionBody = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => viewItem(row)} tooltip="View Full Message" />
            <Button icon="pi pi-pencil" rounded text severity="secondary" onClick={() => editItem(row)} tooltip="Edit" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete" />
        </div>
    );

    const unreadCount = data.filter((d) => d.status === 'unread' || d.status === 'new').length;

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <div className="flex align-items-center gap-2">
                        <h3 className="m-0 font-bold text-900">Contact Inquiries & Messages</h3>
                        {unreadCount > 0 && <Tag severity="danger" value={`${unreadCount} New`} className="font-bold" />}
                    </div>
                    <p className="text-600 m-0 mt-1">Review and manage contact submissions from website visitors</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Message" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No contact messages found.">
                <Column header="Sender" body={senderBodyTemplate} style={{ width: '22%' }} />
                <Column header="Contact Info" body={contactInfoTemplate} style={{ width: '22%' }} />
                <Column header="Your Message" body={messageBodyTemplate} style={{ width: '32%' }} />
                <Column field="status" header="Status" body={statusBodyTemplate} style={{ width: '12%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '12%' }} />
            </DataTable>

            {/* VIEW MODAL */}
            <Dialog
                visible={viewDialogOpen}
                style={{ width: '600px', maxWidth: '95vw' }}
                header="Contact Submission Details"
                modal
                className="p-fluid"
                footer={
                    <div className="flex justify-content-between align-items-center w-full">
                        <div className="flex gap-2">
                            {selectedItem && selectedItem.status !== 'responded' && (
                                <Button
                                    label="Mark as Responded"
                                    icon="pi pi-check-circle"
                                    severity="success"
                                    size="small"
                                    onClick={() => {
                                        updateStatus(selectedItem.id, 'responded');
                                        setViewDialogOpen(false);
                                    }}
                                />
                            )}
                        </div>
                        <Button label="Close" icon="pi pi-times" onClick={() => setViewDialogOpen(false)} />
                    </div>
                }
                onHide={() => setViewDialogOpen(false)}
            >
                {selectedItem && (
                    <div className="flex flex-column gap-3 pt-2">
                        <div className="surface-50 border-1 surface-border border-round p-3">
                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <span className="text-xs text-500 font-semibold block uppercase">Your Name</span>
                                    <span className="text-base font-bold text-900">{selectedItem.name}</span>
                                </div>
                                <div className="col-12 md:col-6">
                                    <span className="text-xs text-500 font-semibold block uppercase">Your Email</span>
                                    <a href={`mailto:${selectedItem.email}`} className="text-base text-primary font-bold hover:underline">
                                        {selectedItem.email}
                                    </a>
                                </div>
                                <div className="col-12 md:col-6">
                                    <span className="text-xs text-500 font-semibold block uppercase">Your Phone</span>
                                    <span className="text-base font-bold font-mono text-900">{selectedItem.phone || 'N/A'}</span>
                                </div>
                                <div className="col-12 md:col-6">
                                    <span className="text-xs text-500 font-semibold block uppercase">Status</span>
                                    {statusBodyTemplate(selectedItem)}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="font-bold block mb-1 text-900">Your Message</label>
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

            {/* ADD / EDIT MODAL */}
            <Dialog
                visible={dialogOpen}
                style={{ width: '580px', maxWidth: '95vw' }}
                header={`${selectedItem ? 'Edit' : 'Add'} Contact Message`}
                modal
                className="p-fluid"
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" text onClick={() => setDialogOpen(false)} />
                        <Button label="Save Message" icon="pi pi-check" onClick={saveItem} />
                    </div>
                }
                onHide={() => setDialogOpen(false)}
            >
                <div className="flex flex-column gap-3 pt-2">
                    <div>
                        <label className="font-bold block mb-1">Your name *</label>
                        <InputText className="w-full" placeholder="e.g. John Doe" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Your email *</label>
                            <InputText className="w-full" placeholder="e.g. john@example.com" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                        </div>
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Your phone *</label>
                            <InputText className="w-full" placeholder="e.g. +880 1711 000000" value={formData.phone || ''} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Status</label>
                        <Dropdown value={formData.status || 'unread'} options={statusOptions} onChange={(e) => setFormData({ ...formData, status: e.value })} placeholder="Select status" className="w-full" />
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Your message *</label>
                        <InputTextarea className="w-full" rows={5} placeholder="Write message content here..." value={formData.message || ''} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
