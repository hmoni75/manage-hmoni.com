/* eslint-disable @next/next/no-img-element */
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
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    const processFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            toast.current?.show({ severity: 'error', summary: 'Invalid File', detail: 'Please select an image file (PNG, JPG, WEBP, etc.)' });
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            toast.current?.show({ severity: 'error', summary: 'File Too Large', detail: 'Photo must be under 8MB' });
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

            const img = new Image();
            img.onload = () => {
                const maxDim = 800;
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
                    setFormData((prev: any) => ({ ...prev, image_url: optimized, avatar: optimized }));
                    toast.current?.show({ severity: 'success', summary: 'Photo Ready', detail: `${file.name} uploaded` });
                } else {
                    setFormData((prev: any) => ({ ...prev, image_url: result, avatar: result }));
                }
                setUploadingImage(false);
            };
            img.onerror = () => {
                setFormData((prev: any) => ({ ...prev, image_url: result, avatar: result }));
                setUploadingImage(false);
            };
            img.src = result;
        };
        reader.onerror = () => {
            setUploadingImage(false);
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to read photo file' });
        };
        reader.readAsDataURL(file);
    };

    const openNew = () => {
        setEditingItem(null);
        setFormData({ rating: 5, image_url: '' });
        setShowUrlInput(false);
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        const img = item.image_url || item.avatar || '';
        setFormData({ ...item, image_url: img });
        setShowUrlInput(Boolean(img && !img.startsWith('data:')));
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
        if (!formData.client_name || !formData.client_name.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Client Name is required' });
            return;
        }

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

    const avatarTemplate = (row: any) => {
        const img = row.image_url || row.avatar;
        if (!img) {
            return <div className="w-2rem h-2rem border-circle surface-300 flex align-items-center justify-content-center text-xs font-bold text-700">{(row.client_name || 'U').charAt(0).toUpperCase()}</div>;
        }
        return (
            <img
                src={img}
                alt={row.client_name}
                className="border-circle shadow-1"
                style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                onError={(e: any) => {
                    e.target.style.display = 'none';
                }}
            />
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
                    <h3 className="m-0 font-bold text-900">Testimonials & Happy Customers</h3>
                    <p className="text-600 m-0 mt-1">Manage client reviews, ratings, and social proof</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Testimonial" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No testimonials found.">
                <Column field="id" header="ID" style={{ width: '5%' }} />
                <Column header="Photo" body={avatarTemplate} style={{ width: '8%' }} />
                <Column field="client_name" header="Client Name" style={{ width: '22%' }} />
                <Column field="client_title" header="Role / Company" style={{ width: '20%' }} />
                <Column field="rating" header="Rating" body={(r) => `${r.rating || 5} ★`} style={{ width: '10%' }} />
                <Column field="content" header="Feedback" style={{ width: '23%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '12%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '560px', maxWidth: '95vw' }}
                header={`${editingItem ? 'Edit' : 'Add'} Testimonial`}
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
                    <div className="grid">
                        <div className="col-12 md:col-6">
                            <label className="font-bold block mb-1">Client Name *</label>
                            <InputText className="w-full" value={formData.client_name || ''} onChange={(e) => setFormData({ ...formData, client_name: e.target.value })} />
                        </div>
                        <div className="col-12 md:col-6">
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

                    {/* Direct Client Photo Upload */}
                    <div>
                        <div className="flex justify-content-between align-items-center mb-1">
                            <label className="font-bold">Client Photo / Avatar</label>
                            <Button type="button" label={showUrlInput ? 'Upload Photo' : 'Enter URL'} icon={showUrlInput ? 'pi pi-upload' : 'pi pi-link'} text size="small" className="p-0 text-xs" onClick={() => setShowUrlInput(!showUrlInput)} />
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
                                <div className="flex align-items-center gap-3">
                                    <img
                                        src={formData.image_url}
                                        alt="Avatar Preview"
                                        className="border-circle shadow-1"
                                        style={{ width: '64px', height: '64px', objectFit: 'cover' }}
                                        onError={(e: any) => {
                                            e.target.src = 'https://via.placeholder.com/100?text=Invalid';
                                        }}
                                    />
                                    <div className="flex-1 overflow-hidden">
                                        <div className="text-xs font-bold text-900 mb-1">Photo Selected</div>
                                        <span className="text-xs text-500 font-mono text-overflow-ellipsis overflow-hidden block">{formData.image_url.startsWith('data:') ? '✅ Uploaded (Base64 ready)' : formData.image_url}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button type="button" icon="pi pi-upload" label="Change" size="small" outlined onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} />
                                        <Button type="button" icon="pi pi-trash" severity="danger" size="small" text onClick={() => setFormData({ ...formData, image_url: '', avatar: '' })} tooltip="Remove Photo" />
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
                                <div className="font-semibold text-sm text-900 mb-1">{uploadingImage ? 'Processing Photo...' : 'Click to Upload or Drag Photo'}</div>
                                <p className="text-xs text-500 m-0">PNG, JPG, WEBP (up to 8MB)</p>
                            </div>
                        )}

                        {showUrlInput && (
                            <div className="mt-2">
                                <InputText
                                    className="w-full text-sm"
                                    placeholder="Or paste photo URL (e.g. /assets/imgs/... or https://...)"
                                    value={formData.image_url || ''}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value, avatar: e.target.value })}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
