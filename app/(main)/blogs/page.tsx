/* eslint-disable @next/next/no-img-element */
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
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.current?.show({ severity: 'error', summary: 'Invalid File', detail: 'Please select an image file (PNG, JPG, WEBP, SVG, etc.)' });
            return;
        }

        if (file.size > 12 * 1024 * 1024) {
            toast.current?.show({ severity: 'error', summary: 'File Too Large', detail: 'Image must be less than 12MB' });
            return;
        }

        setUploadingImage(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            if (!result) {
                setUploadingImage(false);
                return;
            }

            if (file.type.includes('svg') || file.type.includes('gif')) {
                setFormData((prev: any) => ({ ...prev, image_url: result }));
                setUploadingImage(false);
                toast.current?.show({ severity: 'success', summary: 'Uploaded', detail: `${file.name} ready` });
                return;
            }

            const img = new Image();
            img.onload = () => {
                const maxDim = 1920;
                let width = img.width;
                let height = img.height;

                if (width > maxDim || height > maxDim) {
                    if (width > height) {
                        height = Math.round((height * maxDim) / width);
                        width = maxDim;
                    } else {
                        width = Math.round((width * maxDim) / height);
                        height = maxDim;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0, width, height);
                    let optimized = canvas.toDataURL('image/webp', 0.85);
                    if (!optimized.startsWith('data:image/webp')) {
                        optimized = canvas.toDataURL('image/jpeg', 0.85);
                    }
                    setFormData((prev: any) => ({ ...prev, image_url: optimized }));
                    toast.current?.show({ severity: 'success', summary: 'Uploaded', detail: `${file.name} ready` });
                } else {
                    setFormData((prev: any) => ({ ...prev, image_url: result }));
                }
                setUploadingImage(false);
            };
            img.onerror = () => {
                setFormData((prev: any) => ({ ...prev, image_url: result }));
                setUploadingImage(false);
            };
            img.src = result;
        };
        reader.onerror = () => {
            setUploadingImage(false);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Could not read image file' });
        };
        reader.readAsDataURL(file);
    };

    const openNew = () => {
        setEditingItem(null);
        setFormData({ author: 'HMoni', is_published: 1, image_url: '' });
        setShowUrlInput(false);
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        const img = item.image_url || item.cover_image || item.img || '';
        setFormData({ ...item, image_url: img });
        setShowUrlInput(Boolean(img && !img.startsWith('data:')));
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
        if (!formData.title || !formData.title.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Blog Title is required' });
            return;
        }

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

    const imageTemplate = (row: any) => {
        const img = row.image_url || row.cover_image || row.img;
        if (!img) return <span className="text-400 italic text-xs">No image</span>;
        return (
            <div className="flex align-items-center gap-2">
                <img
                    src={img}
                    alt={row.title}
                    className="border-round shadow-1"
                    style={{ width: '56px', height: '40px', objectFit: 'cover' }}
                    onError={(e: any) => {
                        e.target.style.display = 'none';
                    }}
                />
            </div>
        );
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
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Article" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No blog articles found.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column header="Cover" body={imageTemplate} style={{ width: '8%' }} />
                <Column field="title" header="Article Title" style={{ width: '32%' }} />
                <Column field="author" header="Author" style={{ width: '15%' }} />
                <Column field="is_published" header="Status" body={(r) => (r.is_published ? <Tag severity="success" value="Published" /> : <Tag severity="warning" value="Draft" />)} style={{ width: '12%' }} />
                <Column field="views" header="Views" style={{ width: '10%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '18%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '680px', maxWidth: '95vw' }}
                header={`${editingItem ? 'Edit' : 'Add'} Blog Article`}
                modal
                className="p-fluid"
                footer={
                    <div>
                        <Button label="Cancel" icon="pi pi-times" text onClick={() => setDialogOpen(false)} />
                        <Button label="Save Changes" icon="pi pi-check" onClick={saveItem} loading={uploadingImage} />
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
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">URL Slug</label>
                            <InputText className="w-full" placeholder="e.g. building-modern-apps" value={formData.slug || ''} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} />
                        </div>
                        <div className="col-12 md:col-6">
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

                    {/* Direct Cover Image Upload */}
                    <div>
                        <div className="flex justify-content-between align-items-center mb-1">
                            <label className="font-bold">Cover Image</label>
                            <Button type="button" label={showUrlInput ? 'Upload Image' : 'Enter URL'} icon={showUrlInput ? 'pi pi-upload' : 'pi pi-link'} text size="small" className="p-0 text-xs" onClick={() => setShowUrlInput(!showUrlInput)} />
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) processFile(file);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                        />

                        {formData.image_url ? (
                            <div className="border-1 border-round surface-border p-3 surface-50">
                                <div className="relative border-round overflow-hidden shadow-1 mb-2 bg-black-alpha-10 flex align-items-center justify-content-center" style={{ maxHeight: '180px' }}>
                                    <img
                                        src={formData.image_url}
                                        alt="Cover Preview"
                                        style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }}
                                        onError={(e: any) => {
                                            e.target.src = 'https://via.placeholder.com/600x300?text=Invalid+Image+URL';
                                        }}
                                    />
                                </div>
                                <div className="flex justify-content-between align-items-center gap-2">
                                    <span className="text-xs text-600 font-mono text-overflow-ellipsis overflow-hidden" style={{ maxWidth: '350px' }}>
                                        {formData.image_url.startsWith('data:') ? '✅ Uploaded Image (Base64 ready)' : formData.image_url}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button type="button" icon="pi pi-upload" label="Change" size="small" outlined onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} />
                                        <Button type="button" icon="pi pi-trash" severity="danger" size="small" text onClick={() => setFormData({ ...formData, image_url: '' })} tooltip="Remove Image" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    const file = e.dataTransfer.files?.[0];
                                    if (file) processFile(file);
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={() => setIsDragging(false)}
                                className={`border-2 border-dashed border-round p-3 text-center cursor-pointer transition-all ${isDragging ? 'border-primary surface-100' : 'surface-border surface-50 hover:surface-100'}`}
                            >
                                <i className="pi pi-cloud-upload text-3xl text-primary mb-1 block" />
                                <div className="font-semibold text-sm text-900 mb-1">{uploadingImage ? 'Processing Image...' : 'Click to Upload or Drag Cover Image'}</div>
                                <p className="text-xs text-500 m-0">PNG, JPG, WEBP, SVG (up to 12MB, auto-compressed for web)</p>
                            </div>
                        )}

                        {showUrlInput && (
                            <div className="mt-2">
                                <InputText
                                    className="w-full text-sm"
                                    placeholder="Or paste image URL (e.g. /assets/imgs/... or https://...)"
                                    value={formData.image_url || ''}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>
                        )}
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
