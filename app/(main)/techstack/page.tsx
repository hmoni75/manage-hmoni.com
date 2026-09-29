'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';

export default function TechStackPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/techstack', { cache: 'no-store' });
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
        setFormData({ proficiency: 85 });
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tool/skill?')) return;
        try {
            const res = await fetch(`/api/techstack?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Tool deleted' });
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
            const res = await fetch('/api/techstack', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Tool saved' });
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
                    <h3 className="m-0 font-bold text-900">Tech Stack & Tools</h3>
                    <p className="text-600 m-0 mt-1">Manage frameworks, programming languages, and tool proficiency</p>
                </div>
                <Button label="Add Tool" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No tech stack items found.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column field="name" header="Tech / Tool" style={{ width: '30%' }} />
                <Column field="category" header="Category" style={{ width: '25%' }} />
                <Column field="proficiency" header="Proficiency" body={(r) => `${r.proficiency || 0}%`} style={{ width: '20%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '20%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '550px' }}
                header={`${editingItem ? 'Edit' : 'Add'} Tech Stack Item`}
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
                    <div className="grid">
                        <div className="col-6">
                            <label className="font-bold block mb-1">Tech / Tool Name *</label>
                            <InputText className="w-full" placeholder="e.g. Next.js, Docker, Python" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="col-6">
                            <label className="font-bold block mb-1">Category</label>
                            <InputText className="w-full" placeholder="e.g. Frontend, Backend, DevOps" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Icon URL or Class</label>
                        <InputText className="w-full" value={formData.icon_url || ''} onChange={(e) => setFormData({ ...formData, icon_url: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Proficiency % (0 - 100)</label>
                        <InputNumber className="w-full" min={0} max={100} value={formData.proficiency || 80} onValueChange={(e) => setFormData({ ...formData, proficiency: e.value })} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
