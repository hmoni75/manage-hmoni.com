/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import { Toast } from 'primereact/toast';

export default function TechStackPage() {
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
            const res = await fetch('/api/techstack', { cache: 'no-store' });
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
                setFormData((prev: any) => ({ ...prev, image_url: result, thumb: result }));
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
                    setFormData((prev: any) => ({ ...prev, image_url: optimized, thumb: optimized }));
                    toast.current?.show({ severity: 'success', summary: 'Uploaded', detail: `${file.name} uploaded and optimized` });
                } else {
                    setFormData((prev: any) => ({ ...prev, image_url: result, thumb: result }));
                }
                setUploadingImage(false);
            };
            img.onerror = () => {
                setFormData((prev: any) => ({ ...prev, image_url: result, thumb: result }));
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
        setFormData({
            title: '',
            category: '',
            tags: '',
            score: 90,
            sort_order: (data.length || 0) + 1,
            image_url: '',
            thumb: ''
        });
        setShowUrlInput(false);
        setDialogOpen(true);
    };

    const editItem = (item: any) => {
        setEditingItem(item);
        const currentImg = item.image_url || item.thumb || item.icon_url || '';
        setFormData({
            ...item,
            title: item.title || item.name || item.category || '',
            category: item.category || item.title || item.name || '',
            tags: item.tags || (Array.isArray(item.tags_json) ? item.tags_json.join(', ') : ''),
            score: item.score ?? item.proficiency ?? 80,
            image_url: currentImg,
            thumb: currentImg
        });
        setShowUrlInput(Boolean(currentImg && !currentImg.startsWith('data:')));
        setDialogOpen(true);
    };

    const deleteItem = async (id: number) => {
        if (!confirm('Are you sure you want to delete this tech stack category?')) return;
        try {
            const res = await fetch(`/api/techstack?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Deleted', detail: 'Tech stack item deleted' });
                fetchData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: json.error || 'Failed' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error' });
        }
    };

    const saveItem = async () => {
        const titleStr = formData.title?.trim() || formData.name?.trim() || formData.category?.trim();
        if (!titleStr) {
            toast.current?.show({ severity: 'warn', summary: 'Required', detail: 'Category / Stack Title is required' });
            return;
        }

        const method = editingItem ? 'PUT' : 'POST';
        const payload = {
            ...formData,
            title: titleStr,
            name: titleStr,
            category: formData.category?.trim() || titleStr,
            id: editingItem ? editingItem.id : undefined
        };

        try {
            const res = await fetch('/api/techstack', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Tech stack item saved' });
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
        const img = row.image_url || row.thumb || row.icon_url;
        if (!img) return <span className="text-400 italic text-sm">No image</span>;
        const isDataUrl = img.startsWith('data:');
        return (
            <div className="flex align-items-center gap-2">
                <img
                    src={img}
                    alt={row.title || row.name}
                    className="border-round shadow-1"
                    style={{ width: '56px', height: '40px', objectFit: 'cover' }}
                    onError={(e: any) => {
                        e.target.style.display = 'none';
                    }}
                />
                <span className="text-xs text-500 font-mono text-overflow-ellipsis overflow-hidden" style={{ maxWidth: '80px' }}>
                    {isDataUrl ? '[Art Ready]' : img}
                </span>
            </div>
        );
    };

    const tagsBodyTemplate = (row: any) => {
        const raw = row.tags || '';
        let list: string[] = [];
        if (raw) {
            list = raw.split(',').map((t: string) => t.trim()).filter(Boolean);
        } else if (row.tags_json) {
            try {
                list = typeof row.tags_json === 'string' ? JSON.parse(row.tags_json) : row.tags_json;
            } catch {
                list = [];
            }
        }

        if (list.length === 0) return <span className="text-400 italic text-sm">No tools specified</span>;

        return (
            <div className="flex flex-wrap gap-2">
                {list.map((tag: string, idx: number) => (
                    <span
                        key={idx}
                        className="inline-flex align-items-center surface-100 border-round-3xl px-3 py-1 text-xs font-semibold text-800 shadow-1 border-1 surface-border"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        );
    };

    const scoreBodyTemplate = (row: any) => {
        const scoreVal = row.score ?? row.proficiency ?? 80;
        return (
            <div className="flex align-items-center gap-1 font-mono">
                <span className="text-xl font-bold text-900">{scoreVal}</span>
                <span className="text-500 text-sm">/100</span>
            </div>
        );
    };

    const actionBody = (row: any) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => editItem(row)} tooltip="Edit Stack" />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => deleteItem(row.id)} tooltip="Delete Stack" />
        </div>
    );

    return (
        <div className="card shadow-2 border-round-xl p-4 surface-card">
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="m-0 font-bold text-900">Tech Stack & Tools</h3>
                    <p className="text-600 m-0 mt-1">Manage skill categories, tool badges, card thumbnails, and proficiency scores</p>
                </div>
                <div className="flex gap-2">
                    <Button label="Refresh" icon="pi pi-refresh" severity="secondary" outlined onClick={fetchData} />
                    <Button label="Add Category" icon="pi pi-plus" onClick={openNew} />
                </div>
            </div>

            <DataTable value={data} loading={loading} paginator rows={10} responsiveLayout="scroll" emptyMessage="No tech stack items found.">
                <Column field="sort_order" header="#" style={{ width: '6%' }} body={(r) => <span className="font-mono text-500 font-bold">#{r.sort_order || r.id}</span>} />
                <Column header="Thumbnail" body={imageTemplate} style={{ width: '15%' }} />
                <Column
                    field="title"
                    header="Category / Title"
                    body={(r) => <span className="font-bold text-900 text-base">{r.title || r.name}</span>}
                    style={{ width: '20%' }}
                />
                <Column header="Tools & Technologies" body={tagsBodyTemplate} style={{ width: '33%' }} />
                <Column header="Score" body={scoreBodyTemplate} style={{ width: '14%' }} />
                <Column body={actionBody} header="Actions" style={{ width: '12%' }} />
            </DataTable>

            <Dialog
                visible={dialogOpen}
                style={{ width: '600px', maxWidth: '95vw' }}
                header={`${editingItem ? 'Edit' : 'Add'} Tech Stack Item`}
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
                <div className="flex flex-column gap-3 pt-2">
                    {/* Direct Image / Thumbnail Upload Box */}
                    <div>
                        <div className="flex justify-content-between align-items-center mb-1">
                            <label className="font-bold">Card Thumbnail / Artwork</label>
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

                        {formData.image_url || formData.thumb ? (
                            <div className="border-1 border-round surface-border p-3 surface-50">
                                <div className="relative border-round overflow-hidden shadow-1 mb-2 bg-black-alpha-10 flex align-items-center justify-content-center" style={{ maxHeight: '160px' }}>
                                    <img
                                        src={formData.image_url || formData.thumb}
                                        alt="Preview"
                                        style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
                                        onError={(e: any) => {
                                            e.target.src = 'https://via.placeholder.com/600x300?text=Invalid+Image+URL';
                                        }}
                                    />
                                </div>
                                <div className="flex justify-content-between align-items-center gap-2">
                                    <span className="text-xs text-600 font-mono text-overflow-ellipsis overflow-hidden" style={{ maxWidth: '320px' }}>
                                        {(formData.image_url || formData.thumb || '').startsWith('data:') ? '✅ Uploaded Artwork (Ready)' : (formData.image_url || formData.thumb)}
                                    </span>
                                    <div className="flex gap-2">
                                        <Button type="button" icon="pi pi-upload" label="Change" size="small" outlined onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} />
                                        <Button
                                            type="button"
                                            icon="pi pi-trash"
                                            severity="danger"
                                            size="small"
                                            text
                                            onClick={() => setFormData({ ...formData, image_url: '', thumb: '' })}
                                            tooltip="Remove Thumbnail"
                                        />
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
                                <div className="font-semibold text-900 mb-1">{uploadingImage ? 'Processing Image...' : 'Click to Upload Thumbnail or Drag & Drop'}</div>
                                <p className="text-xs text-500 m-0">PNG, JPG, WEBP, GIF, SVG (up to 12MB, auto-compressed for web)</p>
                            </div>
                        )}

                        {showUrlInput && (
                            <div className="mt-2">
                                <InputText
                                    className="w-full text-sm"
                                    placeholder="Or paste artwork URL (e.g. /assets/imgs/pages/img-149.webp)"
                                    value={formData.image_url || formData.thumb || ''}
                                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value, thumb: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="grid">
                        <div className="col-12 md:col-7">
                            <label className="font-bold block mb-1">Category / Stack Title *</label>
                            <InputText
                                className="w-full"
                                placeholder="e.g. Frameworks, Data, MLOps"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value, name: e.target.value, category: e.target.value })}
                            />
                        </div>
                        <div className="col-12 md:col-5">
                            <label className="font-bold block mb-1">Score / 100</label>
                            <div className="p-inputgroup">
                                <InputNumber
                                    className="w-full"
                                    min={0}
                                    max={100}
                                    value={formData.score ?? 80}
                                    onValueChange={(e) => setFormData({ ...formData, score: e.value, proficiency: e.value })}
                                />
                                <span className="p-inputgroup-addon font-bold">/100</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="font-bold block mb-1">Tools & Technologies (Comma-separated badges)</label>
                        <InputText
                            className="w-full"
                            placeholder="e.g. PyTorch, TensorFlow, Scikit-learn"
                            value={formData.tags || ''}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        />
                        <small className="text-500 block mt-1">
                            Separate tools with commas (e.g. PyTorch, TensorFlow, Scikit-learn) to display individual pill badges.
                        </small>
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
                </div>
            </Dialog>
        </div>
    );
}
