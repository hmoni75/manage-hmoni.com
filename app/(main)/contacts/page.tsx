'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';

export default function ContactsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [viewingItem, setViewingItem] = useState<any | null>(null);
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/contacts', { cache: 'no-store' });
            const json = await res.json();
            if (json.success && Array.isArray(json.data)) {
                setData(json.data);
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

    const viewItem = (item: any) => {
        setViewingItem(item);
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this inquiry message?')) return;
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

    const actionBody = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-eye" rounded text severity="info" onClick={() => viewItem(row)} tooltip="View Message" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete" />
        </div>
    );

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Contact Inquiries & Messages</h3>
                    <p className="text-600 m-0 mt-1">Review contact form submissions received from website visitors</p>
                </div>
                <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No contact messages found.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column field="name" header="Name" style={{ width: '20%' }} />
                <Column field="email" header="Email" style={{ width: '20%' }} />
                <Column field="phone" header="Phone" style={{ width: '15%' }} />
                <Column field="subject" header="Subject" style={{ width: '25%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '15%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '550px' }}
                header="Contact Inquiry Details"
                modal
                className="p-fluid"
                footer={<Button label="Close" icon="pi pi-times" onClick={() => setDialogOpen(false)} />}
                onHide={() => setDialogOpen(false)}
            >
                {viewingItem && (
                    <div className="flex flex-column gap-3">
                        <div>
                            <label className="font-bold block mb-1">Sender Name</label>
                            <InputText className="w-full" value={viewingItem.name || ''} readOnly />
                        </div>
                        <div className="grid">
                            <div className="col-6">
                                <label className="font-bold block mb-1">Email</label>
                                <InputText className="w-full" value={viewingItem.email || ''} readOnly />
                            </div>
                            <div className="col-6">
                                <label className="font-bold block mb-1">Phone</label>
                                <InputText className="w-full" value={viewingItem.phone || ''} readOnly />
                            </div>
                        </div>
                        <div>
                            <label className="font-bold block mb-1">Subject</label>
                            <InputText className="w-full" value={viewingItem.subject || ''} readOnly />
                        </div>
                        <div>
                            <label className="font-bold block mb-1">Message</label>
                            <InputTextarea className="w-full" rows={5} value={viewingItem.message || ''} readOnly />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}
