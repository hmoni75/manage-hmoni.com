'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';

export default function StatsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/stats', { cache: 'no-store' });
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
        setFormData({ suffix: '+' });
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this stat?')) return;
        try {
            const res = await fetch(`/api/stats?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Stat deleted' });
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
            const res = await fetch('/api/stats', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Stat saved' });
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
                    <h3 className="m-0 font-bold text-900">Happy Customers & Key Metrics (Stats)</h3>
                    <p className="text-600 m-0 mt-1">Manage global numbers, client achievements, and portfolio counters</p>
                </div>
                <Button label="Add Metric" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No statistics found.">
                <Column field="id" header="ID" style={{ width: '10%' }} />
                <Column field="label" header="Label" style={{ width: '40%' }} />
                <Column
                    header="Value Display"
                    body={(r) => (
                        <span className="font-bold text-xl text-primary">
                            {r.number_value}
                            {r.suffix || ''}
                        </span>
                    )}
                    style={{ width: '30%' }}
                />
                <Column body={actionBody} header="Actions" style={{ width: '20%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '500px' }}
                header={`${editingItem ? 'Edit' : 'Add'} Statistic / Counter`}
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
                        <label className="font-bold block mb-1">Metric Label *</label>
                        <InputText className="w-full" placeholder="e.g. Happy Global Clients" value={formData.label || ''} onChange={(e) => setFormData({ ...formData, label: e.target.value })} />
                    </div>
                    <div className="grid">
                        <div className="col-8">
                            <label className="font-bold block mb-1">Number / Count *</label>
                            <InputText className="w-full" placeholder="e.g. 120" value={formData.number_value || ''} onChange={(e) => setFormData({ ...formData, number_value: e.target.value })} />
                        </div>
                        <div className="col-4">
                            <label className="font-bold block mb-1">Suffix</label>
                            <InputText className="w-full" placeholder="e.g. +, k, %" value={formData.suffix || ''} onChange={(e) => setFormData({ ...formData, suffix: e.target.value })} />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
