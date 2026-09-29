'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';

export default function HeroPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/hero', { cache: 'no-store' });
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
        if (!confirm('Are you sure you want to delete this slide?')) return;
        try {
            const res = await fetch(`/api/hero?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Slide deleted' });
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
            const res = await fetch('/api/hero', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Slide saved' });
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
                    <h3 className="m-0 font-bold text-900">Hero Carousel Slides</h3>
                    <p className="text-600 m-0 mt-1">Manage main homepage banner sliders and call to actions</p>
                </div>
                <Button label="Add Slide" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No hero slides found.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column field="title" header="Title" style={{ width: '30%' }} />
                <Column field="subtitle" header="Subtitle" style={{ width: '35%' }} />
                <Column field="button_text" header="Button" style={{ width: '15%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '15%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '550px' }}
                header={`${editingItem ? 'Edit' : 'Add'} Hero Slide`}
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
                        <label className="font-bold block mb-1">Title *</label>
                        <InputText className="w-full" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Subtitle</label>
                        <InputTextarea className="w-full" rows={3} value={formData.subtitle || ''} onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Image URL</label>
                        <InputText className="w-full" value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                    </div>
                    <div className="grid">
                        <div className="col-6">
                            <label className="font-bold block mb-1">Button Text</label>
                            <InputText className="w-full" value={formData.button_text || ''} onChange={(e) => setFormData({ ...formData, button_text: e.target.value })} />
                        </div>
                        <div className="col-6">
                            <label className="font-bold block mb-1">Button Link</label>
                            <InputText className="w-full" value={formData.button_link || ''} onChange={(e) => setFormData({ ...formData, button_link: e.target.value })} />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
