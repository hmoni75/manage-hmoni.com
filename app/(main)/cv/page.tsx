'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { Tag } from 'primereact/tag';
import { ProgressSpinner } from 'primereact/progressspinner';

interface CVData {
    id: number;
    filename: string;
    file_size: number;
    title: string;
    is_active: number;
    created_at: string;
    updated_at: string;
    file_data?: string;
}

export default function CVPage() {
    const [cvData, setCvData] = useState<CVData | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [titleInput, setTitleInput] = useState('');
    const [selectedFile, setSelectedFile] = useState<{
        filename: string;
        file_data: string;
        file_size: number;
    } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const toast = useRef<Toast>(null);

    const fetchCV = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/cv', { cache: 'no-store' });
            const json = await res.json();
            if (json.success && json.data) {
                setCvData(json.data);
                setTitleInput(json.data.title || 'H Moni Curriculum Vitae');
            } else {
                setCvData(null);
                setTitleInput('H Moni Curriculum Vitae');
            }
        } catch (err: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load CV record',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCV();
    }, []);

    const formatBytes = (bytes: number) => {
        if (!bytes || bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleFileProcess = (file: File) => {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Invalid File',
                detail: 'Only PDF documents are allowed.',
                life: 4000
            });
            return;
        }

        // Limit size to 15MB
        if (file.size > 15 * 1024 * 1024) {
            toast.current?.show({
                severity: 'error',
                summary: 'File Too Large',
                detail: 'PDF size should be under 15MB.',
                life: 4000
            });
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result as string;
            setSelectedFile({
                filename: file.name,
                file_data: base64,
                file_size: file.size
            });
            toast.current?.show({
                severity: 'info',
                summary: 'File Selected',
                detail: `${file.name} (${formatBytes(file.size)}) ready to save.`,
                life: 3000
            });
        };
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileProcess(e.target.files[0]);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileProcess(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleSave = async () => {
        if (!selectedFile && !cvData) {
            toast.current?.show({
                severity: 'warn',
                summary: 'No File',
                detail: 'Please select a PDF file first.',
                life: 3000
            });
            return;
        }

        setUploading(true);
        try {
            const payload = {
                filename: selectedFile ? selectedFile.filename : cvData?.filename,
                file_data: selectedFile ? selectedFile.file_data : cvData?.file_data,
                file_size: selectedFile ? selectedFile.file_size : cvData?.file_size,
                title: titleInput || 'H Moni Curriculum Vitae'
            };

            const res = await fetch('/api/cv', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'CV updated successfully!',
                    life: 3000
                });
                setSelectedFile(null);
                fetchCV();
            } else {
                throw new Error(json.error || 'Failed to save CV');
            }
        } catch (err: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Upload Failed',
                detail: err.message,
                life: 4000
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        try {
            const res = await fetch('/api/cv', { method: 'DELETE' });
            const json = await res.json();
            if (json.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Deleted',
                    detail: 'CV has been removed.',
                    life: 3000
                });
                setCvData(null);
                setSelectedFile(null);
                setDeleteDialog(false);
            }
        } catch (err: any) {
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete CV',
                life: 3000
            });
        }
    };

    const copyPublicUrl = () => {
        const publicUrl = `${window.location.origin}/api/cv/download`;
        navigator.clipboard.writeText(publicUrl);
        toast.current?.show({
            severity: 'info',
            summary: 'Copied',
            detail: 'Public CV URL copied to clipboard!',
            life: 3000
        });
    };

    return (
        <div className="grid">
            <Toast ref={toast} />

            <div className="col-12">
                <div className="card shadow-1 border-round-xl surface-card p-4">
                    <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between mb-4 gap-3">
                        <div>
                            <div className="flex align-items-center gap-2">
                                <i className="pi pi-file-pdf text-red-500 text-3xl"></i>
                                <h1 className="text-2xl font-bold m-0 text-900">CV / Resume Management</h1>
                            </div>
                            <p className="text-500 m-0 mt-1">
                                Manage the single official PDF Curriculum Vitae displayed across your portfolio website.
                            </p>
                        </div>
                        {cvData && (
                            <div className="flex align-items-center gap-2">
                                <Tag severity="success" value="Active / Published" icon="pi pi-check-circle" className="text-sm px-3 py-2" />
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex flex-column align-items-center justify-content-center py-8">
                            <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="4" />
                            <span className="mt-3 text-500">Loading CV details...</span>
                        </div>
                    ) : (
                        <div className="grid">
                            {/* Upload & Info Column */}
                            <div className="col-12 lg:col-5">
                                <div className="p-3 border-1 surface-border border-round-lg mb-4">
                                    <h3 className="text-lg font-semibold text-900 mb-3 flex align-items-center gap-2">
                                        <i className="pi pi-cloud-upload text-primary"></i>
                                        {cvData ? 'Replace / Update CV PDF' : 'Upload New CV PDF'}
                                    </h3>

                                    <div className="field mb-3">
                                        <label htmlFor="cv_title" className="font-medium text-900 mb-2 block">
                                            Document Title / Label
                                        </label>
                                        <InputText
                                            id="cv_title"
                                            value={titleInput}
                                            onChange={(e) => setTitleInput(e.target.value)}
                                            placeholder="e.g. H Moni Curriculum Vitae"
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Drag and Drop Zone */}
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`border-2 border-dashed border-round-xl p-5 text-center cursor-pointer transition-all transition-duration-200 ${
                                            dragOver
                                                ? 'border-primary surface-100'
                                                : selectedFile
                                                ? 'border-green-500 surface-50'
                                                : 'surface-border hover:surface-50'
                                        }`}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="application/pdf,.pdf"
                                            className="hidden"
                                            onChange={handleFileInputChange}
                                        />

                                        <i
                                            className={`pi ${
                                                selectedFile ? 'pi-file-pdf text-green-500' : 'pi-cloud-upload text-500'
                                            } text-5xl mb-3`}
                                        ></i>

                                        {selectedFile ? (
                                            <div>
                                                <p className="font-semibold text-900 text-base mb-1">
                                                    {selectedFile.filename}
                                                </p>
                                                <p className="text-sm text-green-600 font-medium mb-2">
                                                    Ready to upload ({formatBytes(selectedFile.file_size)})
                                                </p>
                                                <span className="text-xs text-500">
                                                    Click or drop another file to change
                                                </span>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-semibold text-900 text-base mb-1">
                                                    Click to browse or drag & drop PDF here
                                                </p>
                                                <p className="text-xs text-500 mb-0">
                                                    Accepts single PDF file up to 15MB
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            label={uploading ? 'Saving...' : 'Save & Publish CV'}
                                            icon="pi pi-check"
                                            loading={uploading}
                                            disabled={!selectedFile && titleInput === cvData?.title}
                                            onClick={handleSave}
                                            className="p-button-primary flex-1"
                                        />
                                        {selectedFile && (
                                            <Button
                                                icon="pi pi-times"
                                                tooltip="Cancel selection"
                                                className="p-button-outlined p-button-secondary"
                                                onClick={() => setSelectedFile(null)}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Active CV Details Card */}
                                {cvData ? (
                                    <div className="p-3 border-1 surface-border border-round-lg">
                                        <h3 className="text-lg font-semibold text-900 mb-3 flex align-items-center gap-2">
                                            <i className="pi pi-info-circle text-primary"></i>
                                            Current CV Information
                                        </h3>

                                        <div className="flex flex-column gap-3 text-sm">
                                            <div className="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
                                                <span className="text-500 font-medium">Filename</span>
                                                <span className="text-900 font-bold">{cvData.filename}</span>
                                            </div>

                                            <div className="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
                                                <span className="text-500 font-medium">File Size</span>
                                                <span className="text-900 font-semibold">{formatBytes(cvData.file_size)}</span>
                                            </div>

                                            <div className="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
                                                <span className="text-500 font-medium">Last Updated</span>
                                                <span className="text-900">
                                                    {new Date(cvData.updated_at).toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="flex justify-content-between align-items-center py-2 border-bottom-1 surface-border">
                                                <span className="text-500 font-medium">Public Stream API</span>
                                                <span className="text-primary font-mono text-xs">/api/cv/download</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            <a
                                                href="/api/cv/download?download=1"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="no-underline flex-1"
                                            >
                                                <Button
                                                    label="Download PDF"
                                                    icon="pi pi-download"
                                                    className="p-button-success w-full"
                                                />
                                            </a>

                                            <a
                                                href="/api/cv/download"
                                                target="_blank"
                                                rel="noreferrer"
                                                className="no-underline flex-1"
                                            >
                                                <Button
                                                    label="Open in New Tab"
                                                    icon="pi pi-external-link"
                                                    className="p-button-outlined p-button-info w-full"
                                                />
                                            </a>

                                            <Button
                                                icon="pi pi-copy"
                                                tooltip="Copy Public Download URL"
                                                className="p-button-outlined p-button-secondary"
                                                onClick={copyPublicUrl}
                                            />

                                            <Button
                                                icon="pi pi-trash"
                                                tooltip="Delete CV"
                                                className="p-button-outlined p-button-danger"
                                                onClick={() => setDeleteDialog(true)}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="p-4 border-1 surface-border border-round-lg text-center text-500">
                                        <i className="pi pi-exclamation-circle text-3xl mb-2 block"></i>
                                        No active CV found in the database. Please upload one using the form above.
                                    </div>
                                )}
                            </div>

                            {/* Live Preview Column */}
                            <div className="col-12 lg:col-7">
                                <div className="p-3 border-1 surface-border border-round-lg h-full flex flex-column">
                                    <div className="flex justify-content-between align-items-center mb-3">
                                        <h3 className="text-lg font-semibold text-900 m-0 flex align-items-center gap-2">
                                            <i className="pi pi-eye text-primary"></i>
                                            Live PDF Preview
                                        </h3>
                                        {selectedFile && (
                                            <Tag severity="warning" value="New File Selected (Unsaved Preview)" />
                                        )}
                                    </div>

                                    <div
                                        className="surface-100 border-1 surface-border border-round-lg flex-1 overflow-hidden"
                                        style={{ minHeight: '620px' }}
                                    >
                                        {selectedFile ? (
                                            <iframe
                                                src={selectedFile.file_data}
                                                title="PDF Preview (Selected)"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 'none', minHeight: '620px' }}
                                            />
                                        ) : cvData?.file_data ? (
                                            <iframe
                                                src={cvData.file_data}
                                                title="PDF Preview (Current)"
                                                width="100%"
                                                height="100%"
                                                style={{ border: 'none', minHeight: '620px' }}
                                            />
                                        ) : (
                                            <div className="flex flex-column align-items-center justify-content-center h-full py-8 text-500">
                                                <i className="pi pi-file text-5xl mb-3"></i>
                                                <p className="m-0 font-medium">No PDF preview available</p>
                                                <span className="text-xs text-400 mt-1">
                                                    Upload a CV file to see the embedded preview here
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog
                visible={deleteDialog}
                style={{ width: '450px' }}
                header="Confirm Deletion"
                modal
                footer={
                    <>
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="p-button-text"
                            onClick={() => setDeleteDialog(false)}
                        />
                        <Button
                            label="Delete CV"
                            icon="pi pi-trash"
                            className="p-button-danger"
                            onClick={handleDelete}
                        />
                    </>
                }
                onHide={() => setDeleteDialog(false)}
            >
                <div className="flex align-items-center gap-3">
                    <i className="pi pi-exclamation-triangle text-red-500 text-4xl" />
                    <span>
                        Are you sure you want to delete the active CV document? Website visitors will no longer be able to download it until you upload a replacement.
                    </span>
                </div>
            </Dialog>
        </div>
    );
}
