'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';

export default function ServicesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/services', { cache: 'no-store' });
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

    const openNew = () => {
        setEditingItem(null);
        setFormData({});
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this service?')) return;
        try {
            const res = await fetch(`/api/services?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Service deleted' });
                fetchData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const saveItem = async () => {
        const method = editingItem ? 'PUT' : 'POST';
        const payload = editingItem ? { ...formData, id: editingItem.id } : formData;

        try {
            const res = await fetch('/api/services', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Service saved' });
                setDialogOpen(false);
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
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editItem(row)} tooltip="Edit" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete" />
        </div>
    );

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Services</h3>
                    <p className="text-600 m-0 mt-1">Manage all offered services and capability descriptions</p>
                </div>
                <Button label="Add Service" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No services found.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column field="title" header="Service Title" style={{ width: '30%' }} />
                <Column field="icon" header="Icon" style={{ width: '15%' }} />
                <Column field="description" header="Description" style={{ width: '35%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '15%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '550px' }}
                header={`${editingItem ? 'Edit' : 'Add'} Service`}
                modal
                className="p-fluid"
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" text onClick={() => setDialogOpen(false)} />
                        <Button label="Save Changes" icon="pi pi-check" onClick={saveItem} />
                    </div>
                }
                onHide={() => setDialogOpen(false)}
            >
                <div className="flex flex-column gap-3">
                    <div>
                        <label className="font-bold block mb-1">Service Title *</label>
                        <InputText className="w-full" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Icon (PrimeIcon name or keyword)</label>
                        <InputText className="w-full" placeholder="e.g. pi-code, pi-desktop, pi-cloud" value={formData.icon || ''} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Description</label>
                        <InputTextarea className="w-full" rows={4} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
