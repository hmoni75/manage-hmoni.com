'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';

export default function ExperiencesPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/experiences', { cache: 'no-store' });
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
        if (!confirm('Are you sure you want to delete this experience record?')) return;
        try {
            const res = await fetch(`/api/experiences?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Experience record deleted' });
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
            const res = await fetch('/api/experiences', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Experience record saved' });
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
                    <h3 className="m-0 font-bold text-900">Work Experience & History</h3>
                    <p className="text-600 m-0 mt-1">Manage career timeline, positions, and company roles</p>
                </div>
                <Button label="Add Experience" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No experiences found.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column field="company" header="Company" style={{ width: '25%' }} />
                <Column field="position" header="Position" style={{ width: '25%' }} />
                <Column header="Duration" body={(r) => `${r.start_date || ''} - ${r.end_date || 'Present'}`} style={{ width: '25%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '20%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '550px' }}
                header={`${editingItem ? 'Edit' : 'Add'} Experience`}
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
                            <label className="font-bold block mb-1">Company / Organization *</label>
                            <InputText className="w-full" value={formData.company || ''} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                        </div>
                        <div className="col-6">
                            <label className="font-bold block mb-1">Position / Role *</label>
                            <InputText className="w-full" value={formData.position || ''} onChange={(e) => setFormData({ ...formData, position: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid">
                        <div className="col-6">
                            <label className="font-bold block mb-1">Start Date</label>
                            <InputText className="w-full" placeholder="e.g. 2021" value={formData.start_date || ''} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} />
                        </div>
                        <div className="col-6">
                            <label className="font-bold block mb-1">End Date</label>
                            <InputText className="w-full" placeholder="e.g. Present" value={formData.end_date || ''} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Description / Key Achievements</label>
                        <InputTextarea className="w-full" rows={3} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
