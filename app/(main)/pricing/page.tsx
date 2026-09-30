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

export default function PricingPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/pricing', { cache: 'no-store' });
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
            name: '',
            price: '$1,200',
            price_numeric: 1200,
            billing_period: '/monthly',
            description: '',
            badge: '',
            is_popular: false,
            button_text: 'Get Started ↗',
            button_link: '#contact',
            features: '',
            sort_order: (data.length || 0) + 1,
            is_active: 1
        });
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        let feats = item.features || '';
        if (!feats && item.features_json) {
            try {
                const list = typeof item.features_json === 'string' ? JSON.parse(item.features_json) : item.features_json;
                feats = Array.isArray(list) ? list.join('\n') : '';
            } catch {
                feats = '';
            }
        }

        setFormData({
            ...item,
            features: feats,
            is_popular: Boolean(item.is_popular)
        });
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this pricing plan?')) return;
        try {
            const res = await fetch(`/api/pricing?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Plan deleted' });
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
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Plan Name is required' });
            return;
        }

        if (!formData.price || !formData.price.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Price is required' });
            return;
        }

        const method = editingItem ? 'PUT' : 'POST';
        const payload = {
            ...formData,
            id: editingItem ? editingItem.id : undefined
        };

        try {
            const res = await fetch('/api/pricing', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Pricing plan saved' });
                setDialogOpen(false);
                fetchData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const planNameTemplate = (row: any) => {
        return (
            <div className="flex flex-column gap-1">
                <div className="flex align-items-center gap-2">
                    <span className="font-bold text-900 text-lg">{row.name}</span>
                    {row.badge && (
                        <span className="bg-orange-500 text-white font-bold text-xs px-2 py-1 border-round uppercase font-mono">
                            {row.badge}
                        </span>
                    )}
                </div>
                <span className="text-xs text-500 font-mono">key: {row.plan_key || row.name.toLowerCase()}</span>
            </div>
        );
    };

    const priceTemplate = (row: any) => {
        return (
            <div>
                <span className="text-2xl font-bold text-900">{row.price}</span>
                <span className="text-600 text-sm">{row.billing_period || '/monthly'}</span>
            </div>
        );
    };

    const featuresTemplate = (row: any) => {
        let list: string[] = [];
        if (row.features) {
            list = row.features.split('\n').map((f: string) => f.trim()).filter(Boolean);
        } else if (row.features_json) {
            try {
                list = typeof row.features_json === 'string' ? JSON.parse(row.features_json) : row.features_json;
            } catch {
                list = [];
            }
        }

        return (
            <div className="flex flex-column gap-1">
                {list.slice(0, 4).map((f: string, i: number) => (
                    <div key={i} className="flex align-items-center gap-2 text-xs text-700">
                        <i className="pi pi-plus-circle text-primary" style={{ fontSize: '0.8rem' }} />
                        <span>{f}</span>
                    </div>
                ))}
                {list.length > 4 && (
                    <span className="text-xs text-500 italic">+{list.length - 4} more features...</span>
                )}
            </div>
        );
    };

    const actionBody = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editItem(row)} tooltip="Edit Plan" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete Plan" />
        </div>
    );

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Pricing Plans & Packages</h3>
                    <p className="text-600 m-0 mt-1">Manage subscription tiers, pricing, features list, and call-to-action buttons</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Plan" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No pricing plans found.">
                <Column field="sort_order" header="#" style={{ width: '6%' }} body={(r) => <span className="font-mono text-500 font-bold">#{r.sort_order || r.id}</span>} />
                <Column header="Plan" body={planNameTemplate} style={{ width: '20%' }} />
                <Column header="Price" body={priceTemplate} style={{ width: '18%' }} />
                <Column
                    field="description"
                    header="Description"
                    body={(r) => <p className="text-sm text-700 m-0 line-height-3">{r.description || '-'}</p>}
                    style={{ width: '24%' }}
                />
                <Column header="Included Features" body={featuresTemplate} style={{ width: '22%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '10%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '650px', maxWidth: '95vw' }}
                header={`${editingItem ? 'Edit' : 'Add'} Pricing Plan`}
                modal
                className="p-fluid"
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" text onClick={() => setDialogOpen(false)} />
                        <Button label="Save Plan" icon="pi pi-check" onClick={saveItem} />
                    </div>
                }
                onHide={() => setDialogOpen(false)}
            >
                <div className="flex flex-column gap-3 pt-2">
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Plan Name *</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. Starter, Growth, Scale"
                                value={formData.name || ''}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Badge Text (Optional)</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. MOST POPULAR"
                                value={formData.badge || ''}
                                onChange={(e) => setFormData({ ...formData, badge: e.target.value, is_popular: Boolean(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Price String *</label>
                            <InputText
                                className="w-full font-bold"
                                placeholder="e.g. $1,200 or $2,800"
                                value={formData.price || ''}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Billing Period</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. /monthly or /yearly"
                                value={formData.billing_period || '/monthly'}
                                onChange={(e) => setFormData({ ...formData, billing_period: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex align-items-center gap-2">
                        <Checkbox
                            inputId="is_popular"
                            checked={Boolean(formData.is_popular)}
                            onChange={(e) => {
                                const checked = Boolean(e.checked);
                                setFormData({
                                    ...formData,
                                    is_popular: checked,
                                    badge: checked && !formData.badge ? 'MOST POPULAR' : formData.badge
                                });
                            }}
                        />
                        <label htmlFor="is_popular" className="text-sm font-semibold cursor-pointer">
                            Mark as Highlighted / Most Popular Tier
                        </label>
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Description</label>
                        <InputTextarea
                            className="w-full"
                            rows={2}
                            placeholder="e.g. A performance-driven plan to accelerate acquisition and conversion."
                            value={formData.description || ''}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Button Text</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. Choose Growth ↗ or Get Started ↗"
                                value={formData.button_text || ''}
                                onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                            />
                        </div>
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Button Link</label>
                            <InputText
                                className="w-full font-mono text-sm"
                                placeholder="e.g. #contact or /contact"
                                value={formData.button_link || '#contact'}
                                onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                            />
                        </div>
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
                        <label className="font-bold block mb-1">Included Features (One feature per line)</label>
                        <InputTextarea
                            className="w-full font-mono text-sm"
                            rows={6}
                            placeholder={`Digital strategy setup\nDigital audit & Insights\nPositioning & Messaging\nSEO & Technical setup\nAnalytics tracking`}
                            value={formData.features || ''}
                            onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                        />
                        <small className="text-500 block mt-1">
                            Type each included feature on a separate line. In the card design, each feature will be marked with a (+) icon.
                        </small>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
