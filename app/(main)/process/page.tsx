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

export default function ProcessPage() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    const toast = useRef<Toast>(null);

    // Direct image upload states
    const [uploadingImage, setUploadingImage] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/process', { cache: 'no-store' });
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

            // SVG / GIF: preserve vector/animation
            if (file.type.includes('svg') || file.type.includes('gif')) {
                setFormData((prev: any) => ({ ...prev, image_url: result }));
                setUploadingImage(false);
                toast.current?.show({ severity: 'success', summary: 'Image Ready', detail: `${file.name} uploaded` });
                return;
            }

            // For JPG, PNG, WEBP: optimize via canvas for fast loading
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
                    toast.current?.show({ severity: 'success', summary: 'Uploaded', detail: `${file.name} uploaded and optimized` });
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const openNew = () => {
        setEditingItem(null);
        setFormData({ step_number: (data.length || 0) + 1, image_url: '' });
        setShowUrlInput(false);
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        setFormData({ ...item });
        setShowUrlInput(Boolean(item.image_url && !item.image_url.startsWith('data:')));
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this step?')) return;
        try {
            const res = await fetch(`/api/process?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Step deleted' });
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
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Step Title is required' });
            return;
        }

        const method = editingItem ? 'PUT' : 'POST';
        const payload = editingItem ? { ...formData, id: editingItem.id } : formData;

        try {
            const res = await fetch('/api/process', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Step saved' });
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
        if (!row.image_url) return <span className="text-400 italic text-sm">No photo</span>;
        const isDataUrl = row.image_url.startsWith('data:');
        return (
            <div className="flex align-items-center gap-2">
                <img
                    src={row.image_url}
                    alt={row.title}
                    className="border-round shadow-1"
                    style={{ width: '56px', height: '40px', objectFit: 'cover' }}
                    onError={(e: any) => {
                        e.target.style.display = 'none';
                    }}
                />
                <span className="text-xs text-500 font-mono text-overflow-ellipsis overflow-hidden" style={{ maxWidth: '100px' }}>
                    {isDataUrl ? '[Photo Uploaded]' : row.image_url}
                </span>
            </div>
        );
    };

    const actionBody = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editItem(row)} tooltip="Edit Step" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete Step" />
        </div>
    );

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Process Philosophy / My Process</h3>
                    <p className="text-600 m-0 mt-1">Manage project workflow, methodology steps and step photos</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Step" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No process steps found.">
                <Column field="step_number" header="Step #" style={{ width: '8%' }} />
                <Column header="Photo" body={imageTemplate} style={{ width: '16%' }} />
                <Column field="title" header="Step Title" style={{ width: '28%' }} />
                <Column field="description" header="Description" style={{ width: '36%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '12%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '580px' }}
                header={`${editingItem ? 'Edit' : 'Add'} Process Step`}
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
                        <div className="col-4">
                            <label className="font-bold block mb-1">Step #</label>
                            <InputNumber className="w-full" value={formData.step_number || 1} onValueChange={(e) => setFormData({ ...formData, step_number: e.value })} />
                        </div>
                        <div className="col-8">
                            <label className="font-bold block mb-1">Step Title *</label>
                            <InputText className="w-full" placeholder="e.g. Discovery & Alignment" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                        </div>
                    </div>

                    {/* Direct Image / Photo Upload Box */}
                    <div>
                        <div className="flex justify-content-between align-items-center mb-1">
                            <label className="font-bold">Step Photo / Image</label>
                            <Button
                                type="button"
                                label={showUrlInput ? 'Switch to File Upload' : 'Enter URL / Path'}
                                icon={showUrlInput ? 'pi pi-upload' : 'pi pi-link'}
                                text
                                size="small"
                                className="p-0 text-xs"
                                onClick={() => setShowUrlInput(!showUrlInput)}
                            />
                        </div>

                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/png,image/jpeg,image/jpg,image/webp,image/gif,image/svg+xml" onChange={handleFileChange} />

                        {formData.image_url ? (
                            <div className="border-1 border-round surface-border p-3 surface-50">
                                <div className="relative border-round overflow-hidden shadow-1 mb-2 bg-black-alpha-10 flex align-items-center justify-content-center" style={{ maxHeight: '180px' }}>
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain' }}
                                        onError={(e: any) => {
                                            e.target.src = 'https://via.placeholder.com/600x300?text=Invalid+Image+URL';
                                        }}
                                    />
                                </div>
                                <div className="flex justify-content-between align-items-center gap-2">
                                    <span className="text-xs text-600 font-mono text-overflow-ellipsis overflow-hidden" style={{ maxWidth: '320px' }}>
                                        {formData.image_url.startsWith('data:') ? '✅ Uploaded Photo (Ready)' : formData.image_url}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button type="button" icon="pi pi-upload" label="Change" size="small" outlined onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} />
                                        <Button type="button" icon="pi pi-trash" severity="danger" size="small" text onClick={() => setFormData({ ...formData, image_url: '' })} tooltip="Remove Photo" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDrop={handleDrop}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                className={`border-2 border-dashed border-round p-4 text-center cursor-pointer transition-all transition-duration-200 ${isDragging ? 'border-primary surface-100' : 'surface-border surface-50 hover:surface-100'}`}
                            >
                                <i className="pi pi-cloud-upload text-4xl text-primary mb-2 block" />
                                <div className="font-semibold text-900 mb-1">{uploadingImage ? 'Processing Photo...' : 'Click to Upload Photo or Drag & Drop'}</div>
                                <p className="text-xs text-500 m-0">PNG, JPG, WEBP, GIF, SVG (up to 12MB, auto-optimized)</p>
                            </div>
                        )}

                        {showUrlInput && (
                            <div className="mt-2">
                                <InputText
                                    className="w-full text-sm"
                                    placeholder="Or paste photo URL (e.g. /assets/imgs/... or https://...)"
                                    value={formData.image_url || ''}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Description</label>
                        <InputTextarea className="w-full" rows={3} placeholder="Describe what happens in this step..." value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
