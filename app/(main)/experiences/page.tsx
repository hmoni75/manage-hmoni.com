'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Tag } from 'primereact/tag';
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
        setEditingItem(null);
        setFormData({
            is_current: false,
            sort_order: (data.length || 0) + 1,
            start_date: '',
            end_date: '',
            period: '',
            position: '',
            company: '',
            description: ''
        });
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        setFormData({
            ...item,
            position: item.position || item.role || '',
            company: item.company || '',
            is_current: Boolean(item.is_current || item.end_date?.toLowerCase() === 'present')
        });
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
        const pos = formData.position?.trim();
        const comp = formData.company?.trim();

        if (!pos) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Position / Role is required' });
            return;
        }

        if (!comp) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Company / Organization is required' });
            return;
        }

        // Auto-generate formatted period if not set manually
        let finalPeriod = formData.period?.trim();
        if (!finalPeriod) {
            if (formData.start_date) {
                const end = formData.is_current ? 'Present' : (formData.end_date || 'Present');
                finalPeriod = `${formData.start_date} — ${end}`;
            }
        }

        const method = editingItem ? 'PUT' : 'POST';
        const payload = {
            ...formData,
            period: finalPeriod,
            role: pos,
            id: editingItem ? editingItem.id : undefined
        };

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

    const durationBodyTemplate = (row: any) => {
        const periodStr = row.period || (row.start_date ? `${row.start_date} — ${row.end_date || 'Present'}` : '-');
        const isCurrent = Boolean(row.is_current || row.end_date?.toLowerCase() === 'present' || periodStr.includes('Present'));
        return (
            <div>
                <div className="font-semibold text-900 font-mono text-sm">{periodStr}</div>
                {isCurrent && <Tag value="Current Role" severity="success" className="text-xs mt-1" />}
            </div>
        );
    };

    const positionBodyTemplate = (row: any) => {
        return (
            <div>
                <div className="font-bold text-900 text-base">{row.position || row.role}</div>
                <div className="mt-1">
                    <span className="font-semibold text-primary surface-100 px-2 py-1 border-round text-xs font-mono">
                        [ {row.company} ]
                    </span>
                </div>
            </div>
        );
    };

    const actionBody = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editItem(row)} tooltip="Edit Experience" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete Experience" />
        </div>
    );

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Work Experience & Timeline</h3>
                    <p className="text-600 m-0 mt-1">Manage professional journey, companies, roles, and key responsibilities</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Experience" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No experiences found.">
                <Column field="sort_order" header="#" style={{ width: '6%' }} body={(r) => <span className="font-mono text-500 font-bold">#{r.sort_order || r.id}</span>} />
                <Column header="Period / Duration" body={durationBodyTemplate} style={{ width: '22%' }} />
                <Column header="Position & Company" body={positionBodyTemplate} style={{ width: '28%' }} />
                <Column
                    field="description"
                    header="Description / Responsibilities"
                    body={(r) => (
                        <p className="text-sm text-700 m-0 line-height-3 text-overflow-ellipsis overflow-hidden" style={{ maxHeight: '60px' }}>
                            {r.description || '-'}
                        </p>
                    )}
                    style={{ width: '32%' }}
                />
                <Column body={actionBody} header="Actions" style={{ width: '12%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '600px', maxWidth: '95vw' }}
                header={`${editingItem ? 'Edit' : 'Add'} Work Experience`}
                modal
                className="p-fluid"
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" text onClick={() => setDialogOpen(false)} />
                        <Button label="Save Experience" icon="pi pi-check" onClick={saveItem} />
                    </div>
                }
                onHide={() => setDialogOpen(false)}
            >
                <div className="flex flex-column gap-3 pt-2">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Position / Role *</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. Senior AI Engineer"
                                value={formData.position || ''}
                                onChange={(e) => setFormData({ ...formData, position: e.target.value, role: e.target.value })}
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Company / Organization *</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. Neural Dynamics"
                                value={formData.company || ''}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Period / Duration String (as displayed in portfolio)</label>
                        <InputText
                            className="w-full font-mono text-sm"
                            placeholder="e.g. Jan 2022 — Present or June 2019 — Dec 2021"
                            value={formData.period || ''}
                            onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        />
                        <small className="text-500 block mt-1">Leave empty to auto-generate from Start Date and End Date below.</small>
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Start Date</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. Jan 2022"
                                value={formData.start_date || ''}
                                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">End Date</label>
                            <InputText
                                className="w-full"
                                placeholder={formData.is_current ? 'Present' : 'e.g. Dec 2021'}
                                disabled={formData.is_current}
                                value={formData.is_current ? 'Present' : (formData.end_date || '')}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex align-items-center gap-2">
                        <Checkbox
                            inputId="is_current"
                            checked={formData.is_current}
                            onChange={(e) => {
                                const checked = Boolean(e.checked);
                                setFormData({
                                    ...formData,
                                    is_current: checked,
                                    end_date: checked ? 'Present' : ''
                                });
                            }}
                        />
                        <label htmlFor="is_current" className="text-sm font-semibold cursor-pointer">
                            Currently working in this position (Present)
                        </label>
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Sort Order / Priority</label>
                            <InputNumber
                                className="w-full"
                                value={formData.sort_order || 1}
                                onValueChange={(e) => setFormData({ ...formData, sort_order: e.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Description / Key Responsibilities & Achievements</label>
                        <InputTextarea
                            className="w-full"
                            rows={4}
                            placeholder="Architecting distributed training systems and leading the deployment of production-grade LLM pipelines..."
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
