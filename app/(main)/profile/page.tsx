'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { formatDate } from '@/lib/date';
import { exportToCSV } from '@/lib/export';

interface UserProfile {
    id: number;
    name: string;
    email: string;
    role: string;
    created_at?: string;
}

interface MemberReport {
    id: number;
    sl_no: number;
    name: string;
    joining_date?: string;
    mobile?: string;
    address?: string;
    share_count: number;
    expected_amount: number;
    remarks?: string;
    total_deposit: number;
    total_penalty: number;
    total_realized: number;
    surplus_deficit: number;
}

interface Installment {
    id: number;
    member_id: number;
    installment_type: string;
    month_name: string;
    deposit_date?: string;
    deposit_amount: number;
    penalty_amount: number;
    remarks?: string;
}

const ProfilePage = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [member, setMember] = useState<MemberReport | null>(null);
    const [installments, setInstallments] = useState<Installment[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog States
    const [editProfileDialog, setEditProfileDialog] = useState(false);
    const [securityDialog, setSecurityDialog] = useState(false);

    // Form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const toast = useRef<Toast>(null);

    const formatCurrency = (amount: number) => {
        return (
            '৳ ' +
            Number(amount || 0).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })
        );
    };

    const fetchProfileData = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/profile');
            const data = await res.json();

            if (data.success && data.user) {
                setUser(data.user);
                setName(data.user.name);
                setEmail(data.user.email);
                setMember(data.member || null);
                setInstallments(data.installments || []);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error || 'Failed to load profile' });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Network error loading profile' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || !email.trim()) {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Name and Email cannot be empty.' });
            return;
        }

        setSavingProfile(true);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email })
            });

            const data = await res.json();

            if (data.success) {
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Profile updated successfully!' });
                setUser(data.user);
                setEditProfileDialog(false);
                fetchProfileData();
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to update profile' });
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!currentPassword) {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'Please enter your current password.' });
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'New password must be at least 6 characters.' });
            return;
        }

        if (newPassword !== confirmNewPassword) {
            toast.current?.show({ severity: 'warn', summary: 'Warning', detail: 'New passwords do not match.' });
            return;
        }

        setSavingPassword(true);

        try {
            const res = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await res.json();

            if (data.success) {
                toast.current?.show({ severity: 'success', summary: 'Success', detail: 'Password changed successfully!' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmNewPassword('');
                setSecurityDialog(false);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Error', detail: data.error });
            }
        } catch {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Failed to change password' });
        } finally {
            setSavingPassword(false);
        }
    };

    const exportExcel = () => {
        if (!member) return;
        const headers = ['Installment Type', 'Month Name', 'Deposit Date', 'Deposit Amount (BDT)', 'Penalty Amount (BDT)', 'Remarks'];
        const rows = installments.map((inst) => [inst.installment_type, inst.month_name, formatDate(inst.deposit_date), inst.deposit_amount, inst.penalty_amount, inst.remarks || '']);
        exportToCSV(`Personal_Ledger_${member.sl_no}_${member.name}`, headers, rows);
    };

    return (
        <div>
            {/* CSS Print Styles */}
            <style jsx global>{`
                @media print {
                    .layout-topbar,
                    .layout-sidebar,
                    .no-print,
                    .screen-only-block {
                        display: none !important;
                    }
                    .layout-main-container {
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    .printable-area {
                        display: block !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        box-shadow: none !important;
                        border: none !important;
                    }
                    body {
                        background: #fff !important;
                        color: #000 !important;
                    }
                }
            `}</style>

            <Toast ref={toast} position="top-right" />

            {/* Profile Overview Header Card with Action Buttons (No Print) */}
            <div className="surface-card p-4 shadow-2 border-round-xl mb-4 flex flex-column md:flex-row justify-content-between align-items-center gap-4 no-print">
                <div className="flex align-items-center gap-4 text-center md:text-left">
                    <div className="surface-300 border-circle flex align-items-center justify-content-center flex-shrink-0" style={{ width: '4.5rem', height: '4.5rem' }}>
                        <i className="pi pi-user text-4xl text-700" />
                    </div>
                    <div>
                        <div className="flex align-items-center justify-content-center md:justify-content-start gap-2">
                            <h2 className="text-2xl font-bold text-900 m-0">{user?.name || 'Loading...'}</h2>
                            <span
                                className={`px-2.5 py-1 font-semibold border-round text-xs uppercase ${
                                    user?.role === 'admin' ? 'bg-purple-100 text-purple-800' : user?.role === 'member' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                }`}
                            >
                                {user?.role === 'user' ? 'user (pending)' : user?.role || 'user'}
                            </span>
                        </div>
                        <span className="text-600 font-medium block mt-1">{user?.email}</span>
                    </div>
                </div>

                {/* Buttons Next to Profile Name / Header */}
                <div className="flex flex-wrap gap-2">
                    {member && (
                        <>
                            <Button label="Print" icon="pi pi-print" className="p-button-outlined p-button-secondary font-semibold" onClick={() => window.print()} />
                            <Button label="Save PDF" icon="pi pi-file-pdf" className="p-button-danger font-semibold" onClick={() => window.print()} />
                            <Button label="Save Excel" icon="pi pi-file-excel" className="p-button-success font-semibold" onClick={exportExcel} />
                        </>
                    )}
                    <Button label="General Information" icon="pi pi-id-card" className="p-button-outlined p-button-primary font-semibold" onClick={() => setEditProfileDialog(true)} />
                    <Button label="Security & Password" icon="pi pi-key" className="p-button-outlined p-button-warning font-semibold" onClick={() => setSecurityDialog(true)} />
                </div>
            </div>

            {/* User Personal Financial Report / PDF 1 View */}
            <div className="surface-card p-4 shadow-2 border-round-xl">
                <div className="border-bottom-1 surface-border pb-3 mb-4 flex flex-column md:flex-row justify-content-between align-items-center gap-2 no-print">
                    <div>
                        <h3 className="text-xl font-bold text-900 m-0">My Personal Member Ledger & Report</h3>
                        <span className="text-600">Personal shares, deposits, penalty, and payment history</span>
                    </div>

                    {member && (
                        <div className="flex flex-wrap align-items-center gap-2">
                            <Button label="Print" icon="pi pi-print" className="p-button-outlined p-button-secondary p-button-sm font-semibold" onClick={() => window.print()} />
                            <Button label="Save PDF" icon="pi pi-file-pdf" className="p-button-danger p-button-sm font-semibold" onClick={() => window.print()} />
                            <Button label="Save Excel" icon="pi pi-file-excel" className="p-button-success p-button-sm font-semibold" onClick={exportExcel} />
                            <div className="text-right ml-2">
                                <span className="text-600 text-sm block">Member ID / SL: #{member.sl_no}</span>
                                <span className="text-primary font-bold">{member.address}</span>
                            </div>
                        </div>
                    )}
                </div>

                {user?.role === 'user' ? (
                    <div className="text-center py-6">
                        <i className="pi pi-clock text-5xl text-yellow-500 mb-3 block" />
                        <h4 className="text-900 font-bold mb-2">Account Pending Approval</h4>
                        <p className="text-600 max-w-25rem mx-auto line-height-3">
                            Your signup registration is currently pending admin approval. Once an administrator sets your role to <strong>Member</strong> or <strong>Admin</strong>, your member ledger and financial statements will be displayed here.
                        </p>
                    </div>
                ) : member ? (
                    <>
                        {/* Screen View Layout (Hidden on Print) */}
                        <div className="screen-only-block">
                            {/* Member KPI Summary Cards */}
                            <div className="grid mb-4">
                                <div className="col-12 sm:col-6 lg:col-3">
                                    <div className="p-3 surface-100 border-round text-center">
                                        <span className="text-600 block font-semibold mb-1">My Shares</span>
                                        <span className="text-2xl font-bold text-orange-600">{member.share_count} Units</span>
                                    </div>
                                </div>
                                <div className="col-12 sm:col-6 lg:col-3">
                                    <div className="p-3 surface-100 border-round text-center">
                                        <span className="text-600 block font-semibold mb-1">Total Deposit</span>
                                        <span className="text-2xl font-bold text-blue-600">{formatCurrency(member.total_deposit)}</span>
                                    </div>
                                </div>
                                <div className="col-12 sm:col-6 lg:col-3">
                                    <div className="p-3 surface-100 border-round text-center">
                                        <span className="text-600 block font-semibold mb-1">Total Realized</span>
                                        <span className="text-2xl font-bold text-purple-600">{formatCurrency(member.total_realized)}</span>
                                    </div>
                                </div>
                                <div className="col-12 sm:col-6 lg:col-3">
                                    <div className="p-3 surface-100 border-round text-center">
                                        <span className="text-600 block font-semibold mb-1">Surplus / Deficit</span>
                                        <span className={`text-2xl font-bold ${member.surplus_deficit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(member.surplus_deficit)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Installment Table */}
                            <h5 className="font-bold text-900 mb-3">Installment Payment History</h5>
                            <DataTable value={installments} loading={loading} responsiveLayout="scroll" className="p-datatable-gridlines">
                                <Column field="installment_type" header="Type" style={{ width: '20%' }} />
                                <Column field="month_name" header="Month" style={{ width: '20%' }} />
                                <Column field="deposit_date" header="Deposit Date" body={(d) => formatDate(d.deposit_date)} style={{ width: '15%' }} />
                                <Column field="deposit_amount" header="Deposit Amount" body={(d) => formatCurrency(d.deposit_amount)} style={{ width: '15%' }} />
                                <Column field="penalty_amount" header="Penalty" body={(d) => formatCurrency(d.penalty_amount)} style={{ width: '15%' }} />
                                <Column field="remarks" header="Remarks" style={{ width: '15%' }} />
                            </DataTable>
                        </div>

                        {/* Official PDF 1 Printable Layout (Shown on Print) */}
                        <div className="printable-area hidden">
                            <div className="text-center border-bottom-2 surface-border pb-3 mb-4">
                                <h2 className="text-3xl font-bold text-900 m-0" style={{ color: '#1B365D' }}>
                                    নবধারা আরিয়ান সোসাইটি
                                </h2>
                                <div className="text-700 font-medium mt-1">আরিয়ান সিটি, বনগাঁও, সাভার, ঢাকা — ১লা জানুয়ারি, ২০২৬ খ্রিস্টাব্দ</div>
                                <div className="text-xl font-bold text-primary mt-2">১ম পাতা - সদস্য কিস্তি হিসাব ({member.name})</div>
                            </div>

                            <table className="w-full mb-4 text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                                <tbody>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>SL No:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>{member.sl_no}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Name:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>{member.name}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Mobile:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>{member.mobile}</td>
                                    </tr>
                                    <tr>
                                        <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Address:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>{member.address}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Shares:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc' }}>{member.share_count}</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc', fontWeight: 'bold' }}>Total Deposit:</td>
                                        <td style={{ padding: '8px', border: '1px solid #ccc', color: 'blue', fontWeight: 'bold' }}>{formatCurrency(member.total_deposit)}</td>
                                    </tr>
                                </tbody>
                            </table>

                            <table className="w-full text-sm" style={{ borderCollapse: 'collapse', border: '1px solid #ccc' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#1B365D', color: '#fff', textAlign: 'center' }}>
                                        <th style={{ padding: '8px', border: '1px solid #ccc' }}>Type</th>
                                        <th style={{ padding: '8px', border: '1px solid #ccc' }}>Month</th>
                                        <th style={{ padding: '8px', border: '1px solid #ccc' }}>Deposit Date</th>
                                        <th style={{ padding: '8px', border: '1px solid #ccc' }}>Deposit Amount</th>
                                        <th style={{ padding: '8px', border: '1px solid #ccc' }}>Penalty</th>
                                        <th style={{ padding: '8px', border: '1px solid #ccc' }}>Remarks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {installments.map((inst) => (
                                        <tr key={inst.id} style={{ textAlign: 'center' }}>
                                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>{inst.installment_type}</td>
                                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>{inst.month_name}</td>
                                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatDate(inst.deposit_date)}</td>
                                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(inst.deposit_amount)}</td>
                                            <td style={{ padding: '6px', border: '1px solid #ccc' }}>{formatCurrency(inst.penalty_amount)}</td>
                                            <td style={{ padding: '6px', border: '1px solid #ccc', fontSize: '12px' }}>{inst.remarks}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6 text-600">
                        <i className="pi pi-info-circle text-4xl text-blue-500 mb-3 block" />
                        <h4 className="text-900 font-bold mb-2">No Linked Member Record Found</h4>
                        <p className="m-0 max-w-20rem mx-auto">Your account is active. If your account corresponds to a shareholder, please ensure your profile name or email matches your member ledger name.</p>
                    </div>
                )}
            </div>

            {/* General Information Modal Dialog */}
            <Dialog visible={editProfileDialog} style={{ width: '450px' }} header="General Information" modal onHide={() => setEditProfileDialog(false)}>
                <form onSubmit={handleUpdateProfile} className="p-fluid">
                    <div className="mb-4">
                        <label htmlFor="modal-name" className="block text-900 font-semibold mb-2">
                            Full Name
                        </label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-user" />
                            <InputText id="modal-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" required />
                        </span>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="modal-email" className="block text-900 font-semibold mb-2">
                            Email Address
                        </label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-envelope" />
                            <InputText id="modal-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
                        </span>
                    </div>

                    <Button
                        label={savingProfile ? 'Saving...' : 'Save Profile Changes'}
                        icon={savingProfile ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                        className="p-button-primary font-semibold border-round-xl p-3"
                        disabled={savingProfile}
                        type="submit"
                    />
                </form>
            </Dialog>

            {/* Security & Password Modal Dialog */}
            <Dialog visible={securityDialog} style={{ width: '450px' }} header="Security & Password" modal onHide={() => setSecurityDialog(false)}>
                <form onSubmit={handleChangePassword} className="p-fluid">
                    <div className="mb-4">
                        <label htmlFor="modal-current-pass" className="block text-900 font-semibold mb-2">
                            Current Password
                        </label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-lock z-2" />
                            <Password inputId="modal-current-pass" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" toggleMask feedback={false} inputClassName="w-full pl-5 p-3" />
                        </span>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="modal-new-pass" className="block text-900 font-semibold mb-2">
                            New Password
                        </label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-shield z-2" />
                            <Password inputId="modal-new-pass" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min. 6 characters" toggleMask feedback={true} inputClassName="w-full pl-5 p-3" />
                        </span>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="modal-confirm-pass" className="block text-900 font-semibold mb-2">
                            Confirm New Password
                        </label>
                        <span className="p-input-icon-left w-full">
                            <i className="pi pi-check-circle z-2" />
                            <Password inputId="modal-confirm-pass" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Re-enter new password" toggleMask feedback={false} inputClassName="w-full pl-5 p-3" />
                        </span>
                    </div>

                    <Button
                        label={savingPassword ? 'Updating Password...' : 'Update Password'}
                        icon={savingPassword ? 'pi pi-spin pi-spinner' : 'pi pi-lock'}
                        className="p-button-warning font-semibold border-round-xl p-3"
                        disabled={savingPassword}
                        type="submit"
                    />
                </form>
            </Dialog>
        </div>
    );
};

export default ProfilePage;
