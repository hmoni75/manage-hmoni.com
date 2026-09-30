'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
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
        const nextNum = String((data.length || 0) + 1).padStart(2, '0');
        setFormData({
            num: nextNum,
            title: '',
            description: '',
            tags: '',
            icon: 'pi-palette',
            sort_order: (data.length || 0) + 1
        });
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        let tagsStr = '';
        if (item.tags_json) {
            try {
                const parsed = JSON.parse(item.tags_json);
                if (Array.isArray(parsed)) {
                    tagsStr = parsed.join(', ');
                }
            } catch {
                tagsStr = item.tags_json;
            }
        }
        setFormData({
            ...item,
            description: item.description || item.desc_text || '',
            tags: tagsStr
        });
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
        if (!formData.title || !formData.title.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Service Title is required' });
            return;
        }

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
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Service saved successfully' });
                setDialogOpen(false);
                fetchData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const parseTags = (tagsJson: any): string[] => {
        if (!tagsJson) return [];
        if (Array.isArray(tagsJson)) return tagsJson;
        try {
            const parsed = JSON.parse(tagsJson);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return String(tagsJson)
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean);
        }
        return [];
    };

    const tagsBodyTemplate = (row: any) => {
        const tags = parseTags(row.tags_json);
        if (tags.length === 0) return <span className="text-400 italic text-xs">-</span>;
        return (
            <div className="flex flex-wrap gap-1">
                {tags.map((tag: string, index: number) => (
                    <Tag key={index} value={tag} severity="info" className="text-xs font-normal" />
                ))}
            </div>
        );
    };

    const actionBody = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editItem(row)} tooltip="Edit Service" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete Service" />
        </div>
    );

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Services & Capabilities</h3>
                    <p className="text-600 m-0 mt-1">Manage all offered services, descriptions, numbers, and deliverables</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Service" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No services found.">
                <Column field="num" header="#" body={(r) => <span className="font-mono font-bold text-primary surface-100 px-2 py-1 border-round text-xs">{r.num || String(r.id).padStart(2, '0')}</span>} style={{ width: '8%' }} />
                <Column
                    field="title"
                    header="Service Title"
                    body={(r) => (
                        <div className="flex align-items-center gap-2">
                            {r.icon && <i className={`${r.icon} text-primary`} />}
                            <span className="font-bold text-900">{r.title}</span>
                        </div>
                    )}
                    style={{ width: '25%' }}
                />
                <Column field="description" header="Description" body={(r) => <span className="text-sm text-700">{r.description || r.desc_text}</span>} style={{ width: '37%' }} />
                <Column header="Deliverables / Tags" body={tagsBodyTemplate} style={{ width: '20%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '10%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '600px', maxWidth: '95vw' }}
                header={`${editingItem ? 'Edit Service' : 'Add New Service'}`}
                modal
                className="p-fluid"
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" text onClick={() => setDialogOpen(false)} />
                        <Button label="Save Service" icon="pi pi-check" onClick={saveItem} />
                    </div>
                }
                onHide={() => setDialogOpen(false)}
            >
                <div className="flex flex-column gap-3 pt-2">
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label className="font-bold block mb-1">Number (#)</label>
                            <InputText className="w-full font-mono" placeholder="e.g. 01" value={formData.num || ''} onChange={(e) => setFormData({ ...formData, num: e.target.value })} />
                        </div>
                        <div className="col-12 md:col-8">
                            <label className="font-bold block mb-1">Service Title *</label>
                            <InputText className="w-full" placeholder="e.g. Brand Identity" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Description *</label>
                        <InputTextarea
                            className="w-full"
                            rows={3}
                            placeholder="e.g. Logo systems, type pairings, color, and visual language that travels across every touchpoint."
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value, desc_text: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Deliverables / Tags (comma-separated)</label>
                        <InputText className="w-full" placeholder="e.g. Logo, Type system, Guidelines" value={formData.tags || ''} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
                        <small className="text-500 block mt-1">Separate tags with commas (e.g. Logo, Type system, Guidelines)</small>
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Icon (PrimeIcon class)</label>
                            <InputText className="w-full" placeholder="e.g. pi-palette, pi-code, pi-desktop" value={formData.icon || ''} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
                        </div>
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Sort Order</label>
                            <InputNumber className="w-full" value={formData.sort_order || 0} onValueChange={(e) => setFormData({ ...formData, sort_order: e.value })} />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
