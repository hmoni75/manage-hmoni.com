'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Toast } from 'primereact/toast';

export default function TestimonialsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/testimonials', { cache: 'no-store' });
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
        setFormData({ rating: 5 });
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this testimonial?')) return;
        try {
            const res = await fetch(`/api/testimonials?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Testimonial deleted' });
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
            const res = await fetch('/api/testimonials', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Testimonial saved' });
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
                    <h3 className="m-0 font-bold text-900">Testimonials & Happy Customers</h3>
                    <p className="text-600 m-0 mt-1">Manage client reviews, ratings, and social proof</p>
                </div>
                <Button label="Add Testimonial" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No testimonials found.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column field="client_name" header="Client Name" style={{ width: '25%' }} />
                <Column field="client_title" header="Role / Company" style={{ width: '20%' }} />
                <Column field="rating" header="Rating" body={(r) => `${r.rating || 5} ★`} style={{ width: '10%' }} />
                <Column field="content" header="Feedback" style={{ width: '25%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '15%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '550px' }}
                header={`${editingItem ? 'Edit' : 'Add'} Testimonial`}
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
                            <label className="font-bold block mb-1">Client Name *</label>
                            <InputText className="w-full" value={formData.client_name || ''} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
                        </div>
                        <div className="col-6">
                            <label className="font-bold block mb-1">Client Role / Company</label>
                            <InputText className="w-full" placeholder="e.g. CEO at Acme" value={formData.client_title || ''} onChange={(e) => setFormData({ ...formData, client_title: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Rating (1 to 5)</label>
                        <InputNumber className="w-full" min={1} max={5} value={formData.rating || 5} onValueChange={(e) => setFormData({ ...formData, rating: e.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Testimonial / Review *</label>
                        <InputTextarea className="w-full" rows={4} value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Photo URL</label>
                        <InputText className="w-full" value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
