/* eslint-disable @next/next/no-img-element */
'use client';

import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Toast } from 'primereact/toast';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface SummaryData {
    totalDeposit: number;
    totalPenalty?: number;
    totalRealized?: number;
    totalShares: number;
    totalMembers?: number;
    totalExpected?: number;
    totalExpenses: number;
    netBalance: number;
    totalSurplusDeficit?: number;
}

const Dashboard = () => {
    const [userRole, setUserRole] = useState<string>('');
    const [summary, setSummary] = useState<SummaryData>({
        totalDeposit: 0,
        totalShares: 0,
        totalExpenses: 0,
        netBalance: 0
    });
    const [recentMembers, setRecentMembers] = useState<any[]>([]);
    const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
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

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Check current user role
                const authRes = await fetch('/api/auth/me', { cache: 'no-store' });
                const authData = await authRes.json();
                if (authData.authenticated && authData.user) {
                    const role = authData.user.role || 'user';
                    setUserRole(role);

                    // If role is unapproved 'user', stop fetching dashboard data
                    if (role === 'user') {
                        setLoading(false);
                        return;
                    }
                }

                // Concurrent fetch with no-store cache to ensure real-time fresh DB data
                const [sumRes, memRes, expRes] = await Promise.all([fetch('/api/summary', { cache: 'no-store' }), fetch('/api/members', { cache: 'no-store' }), fetch('/api/expenses', { cache: 'no-store' })]);

                const sumJson = await sumRes.json();
                const memJson = await memRes.json();
                const expJson = await expRes.json();

                if (sumJson.success && sumJson.data) {
                    setSummary(sumJson.data);
                } else if (sumJson.error) {
                    toast.current?.show({ severity: 'error', summary: 'Error', detail: sumJson.error });
                }

                if (memJson.success && Array.isArray(memJson.data)) {
                    setRecentMembers(memJson.data.slice(0, 5));
                }

                if (expJson.success && Array.isArray(expJson.data)) {
                    setRecentExpenses(expJson.data.slice(0, 5));
                }
            } catch (err) {
                console.error('Failed to load dashboard summary:', err);
                toast.current?.show({ severity: 'error', summary: 'Network Error', detail: 'Failed to connect to backend APIs' });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        window.addEventListener('focus', fetchDashboardData);
        return () => {
            window.removeEventListener('focus', fetchDashboardData);
        };
    }, []);

    if (!loading && userRole === 'user') {
        return (
            <div className="surface-card p-6 shadow-2 border-round-xl text-center my-6 max-w-30rem mx-auto">
                <i className="pi pi-clock text-6xl text-yellow-500 mb-3 block" />
                <h3 className="text-2xl font-bold text-900 mb-2">Account Pending Approval</h3>
                <p className="text-600 line-height-3 mb-4">
                    Thank you for signing up with <strong>Nobodhara Aryan Society</strong>. Your registration is currently pending administrator approval. Once an administrator approves your account and sets your role to <strong>Member</strong> or{' '}
                    <strong>Admin</strong>, you will gain access to the dashboard and financial ledger.
                </p>
                <div className="p-3 bg-yellow-50 border-1 border-yellow-200 border-round text-yellow-900 text-sm font-semibold">Status: Pending Role Assignment by Admin</div>
            </div>
        );
    }

    return (
        <div>
            <Toast ref={toast} position="top-right" />

            {/* Header Banner */}
            <div className="surface-card p-4 shadow-2 border-round-xl mb-4 text-center">
                <h2 className="text-3xl font-bold text-900 mb-1">Nobodhara Aryan Society</h2>
                <p className="text-600 font-medium m-0">Aryan City, Bongaon, Savar, Dhaka</p>
                <div className="text-primary font-bold text-xl mt-2">Financial Dashboard & Ledger Overview</div>
            </div>

            {/* 4 PDF Summary Cards */}
            <div className="grid">
                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0 shadow-2 border-round-xl surface-card">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-600 font-bold mb-2">Total Deposit</span>
                                <div className="text-900 font-bold text-2xl text-blue-600">{formatCurrency(summary.totalDeposit)}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-blue-100 border-round-circle" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-wallet text-blue-600 text-2xl" />
                            </div>
                        </div>
                        <span className="text-500 font-medium">Total Member Deposits Received</span>
                    </div>
                </div>

                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0 shadow-2 border-round-xl surface-card">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-600 font-bold mb-2">Total Shares</span>
                                <div className="text-900 font-bold text-2xl text-orange-600">{summary.totalShares} Units</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-orange-100 border-round-circle" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-chart-pie text-orange-600 text-2xl" />
                            </div>
                        </div>
                        <span className="text-500 font-medium">Active Member Shares Count</span>
                    </div>
                </div>

                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0 shadow-2 border-round-xl surface-card">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-600 font-bold mb-2">Total Expenses</span>
                                <div className="text-900 font-bold text-2xl text-purple-600">{formatCurrency(summary.totalExpenses)}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-purple-100 border-round-circle" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-shopping-bag text-purple-600 text-2xl" />
                            </div>
                        </div>
                        <span className="text-500 font-medium">Total Expenses & Installments Paid</span>
                    </div>
                </div>

                <div className="col-12 lg:col-6 xl:col-3">
                    <div className="card mb-0 shadow-2 border-round-xl surface-card">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-600 font-bold mb-2">Net Balance</span>
                                <div className={`font-bold text-2xl ${summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(summary.netBalance)}</div>
                            </div>
                            <div className="flex align-items-center justify-content-center bg-green-100 border-round-circle" style={{ width: '3rem', height: '3rem' }}>
                                <i className="pi pi-dollar text-green-600 text-2xl" />
                            </div>
                        </div>
                        <span className="text-500 font-medium">Total Deposit - Total Expenses</span>
                    </div>
                </div>
            </div>

            {/* Preview Tables Section */}
            <div className="grid mt-4">
                <div className="col-12 lg:col-6">
                    <div className="card shadow-2 border-round-xl surface-card">
                        <div className="flex justify-content-between align-items-center mb-3">
                            <h5 className="m-0 font-bold text-900">Recent Members</h5>
                            <Link href="/members">
                                <Button label="View All" icon="pi pi-arrow-right" text iconPos="right" />
                            </Link>
                        </div>
                        <DataTable value={recentMembers} rows={5} loading={loading} responsiveLayout="scroll">
                            <Column field="sl_no" header="SL" style={{ width: '10%' }} />
                            <Column
                                field="name"
                                header="Name"
                                style={{ width: '35%' }}
                                body={(m) => (
                                    <Link href={`/members/${m.id}`} className="font-bold text-primary hover:underline flex align-items-center gap-1">
                                        <i className="pi pi-user text-xs" />
                                        {m.name}
                                    </Link>
                                )}
                            />
                            <Column field="mobile" header="Mobile" style={{ width: '25%' }} />
                            <Column field="total_realized" header="Total Realized" body={(d) => formatCurrency(d.total_realized)} style={{ width: '30%' }} />
                        </DataTable>
                    </div>
                </div>

                <div className="col-12 lg:col-6">
                    <div className="card shadow-2 border-round-xl surface-card">
                        <div className="flex justify-content-between align-items-center mb-3">
                            <h5 className="m-0 font-bold text-900">Recent Expenses</h5>
                            <Link href="/expenses">
                                <Button label="View All" icon="pi pi-arrow-right" text iconPos="right" />
                            </Link>
                        </div>
                        <DataTable value={recentExpenses} rows={5} loading={loading} responsiveLayout="scroll">
                            <Column field="sl_no" header="SL" style={{ width: '10%' }} />
                            <Column field="expense_title" header="Item Title" style={{ width: '40%' }} />
                            <Column field="payment_method" header="Payment" style={{ width: '20%' }} />
                            <Column field="amount" header="Amount" body={(d) => formatCurrency(d.amount)} style={{ width: '30%' }} />
                        </DataTable>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
