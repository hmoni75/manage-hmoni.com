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

export default function ProjectsPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/projects', { cache: 'no-store' });
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
        if (!confirm('Are you sure you want to delete this project?')) return;
        try {
            const res = await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Project deleted' });
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
            const res = await fetch('/api/projects', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Project saved' });
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
                    <h3 className="m-0 font-bold text-900">Projects & Highlighted Projects</h3>
                    <p className="text-600 m-0 mt-1">Manage all portfolio showcase projects and highlights</p>
                </div>
                <Button label="Add Project" icon="pi pi-plus" onClick={openNew} />
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No projects found.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column field="title" header="Project Title" style={{ width: '25%' }} />
                <Column field="category" header="Category" style={{ width: '15%' }} />
                <Column field="tech_used" header="Tech Stack" style={{ width: '20%' }} />
                <Column field="is_highlighted" header="Highlighted" body={(r) => (r.is_highlighted ? <Tag severity="success" value="Yes" /> : <Tag severity="info" value="No" />)} style={{ width: '15%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '15%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '600px' }}
                header={`${editingItem ? 'Edit' : 'Add'} Project`}
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
                        <label className="font-bold block mb-1">Project Title *</label>
                        <InputText className="w-full" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Category</label>
                        <InputText className="w-full" placeholder="e.g. Web App, Mobile, Full Stack" value={formData.category || ''} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Description</label>
                        <InputTextarea className="w-full" rows={3} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Technologies Used</label>
                        <InputText className="w-full" placeholder="e.g. Next.js, MySQL, Tailwind" value={formData.tech_used || ''} onChange={(e) => setFormData({ ...formData, tech_used: e.target.value })} />
                    </div>
                    <div>
                        <label className="font-bold block mb-1">Image URL</label>
                        <InputText className="w-full" value={formData.image_url || ''} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                    </div>
                    <div className="grid">
                        <div className="col-6">
                            <label className="font-bold block mb-1">Live URL</label>
                            <InputText className="w-full" value={formData.project_url || ''} onChange={(e) => setFormData({ ...formData, project_url: e.target.value })} />
                        </div>
                        <div className="col-6">
                            <label className="font-bold block mb-1">GitHub URL</label>
                            <InputText className="w-full" value={formData.github_url || ''} onChange={(e) => setFormData({ ...formData, github_url: e.target.value })} />
                        </div>
                    </div>
                    <div className="flex align-items-center gap-2 mt-2">
                        <InputSwitch checked={!!formData.is_highlighted} onChange={(e) => setFormData({ ...formData, is_highlighted: e.value ? 1 : 0 })} />
                        <label className="font-bold">Highlight on Home Page</label>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
