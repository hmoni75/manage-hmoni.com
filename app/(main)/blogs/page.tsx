'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { InputSwitch } from 'primereact/inputswitch';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

export default function BlogsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/blogs', { cache: 'no-store' });
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
        setFormData({ author: 'HMoni', is_published: 1 });
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this blog post?')) return;
        try {
            const res = await fetch(`/api/blogs?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Blog deleted' });
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
            const res = await fetch('/api/blogs', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Blog saved' });
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
                    <h3 className="m-0 font-bold text-900">Blog & Resources</h3>
                    <p className="text-600 m-0 mt-1">Manage articles, resources, insights, and publish state</p>
                </div>
                <Button label="Add Article" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No blog articles found.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column field="title" header="Article Title" style={{ width: '35%' }} />
                <Column field="author" header="Author" style={{ width: '15%' }} />
                <Column field="is_published" header="Status" body={(r) => (r.is_published ? <Tag severity="success" value="Published" /> : <Tag severity="warning" value="Draft" />)} style={{ width: '15%' }} />
                <Column field="views" header="Views" style={{ width: '10%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '20%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '650px' }}
                header={`${editingItem ? 'Edit' : 'Add'} Blog Article`}
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
                        <label className="font-bold block mb-1">Blog Title *</label>
                        <InputText className="w-full" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div className="grid">
                        <div className="col-6">
                            <label className="font-bold block mb-1">URL Slug</label>
                            <InputText className="w-full" placeholder="e.g. building-modern-apps" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                        </div>
                        <div className="col-6">
                            <label className="font-bold block mb-1">Author</label>
                            <InputText className="w-full" value={formData.author || 'HMoni'} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
                        </div>
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Short Excerpt</label>
                        <InputTextarea className="w-full" rows={2} value={formData.excerpt || ''} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Full Content (Markdown or HTML)</label>
                        <InputTextarea className="w-full" rows={6} value={formData.content || ''} onChange={(e) => setFormData({ ...formData, content: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Cover Image URL</label>
                        <InputText className="w-full" value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Tags (comma-separated)</label>
                        <InputText className="w-full" placeholder="e.g. web, react, design" value={formData.tags || ''} onChange={(e) => setFormData({ ...formData, tags: e.target.value })} />
                    </div>
                    <div className="flex align-items-center gap-2 mt-2">
                        <InputSwitch checked={!!formData.is_published} onChange={(e) => setFormData({ ...formData, is_published: e.value ? 1 : 0 })} />
                        <label className="font-bold">Publish Live</label>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
