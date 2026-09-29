/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useContext, useRef, useState } from 'react';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { LayoutContext } from '../../../../layout/context/layoutcontext';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { classNames } from 'primereact/utils';
import Link from 'next/link';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const toast = useRef<Toast>(null);
    const { layoutConfig } = useContext(LayoutContext);

    const containerClassName = classNames('surface-ground flex align-items-center justify-content-center min-h-screen min-w-screen p-4 overflow-hidden', { 'p-input-filled': layoutConfig.inputStyle === 'filled' });

    const showError = (message: string) => {
        toast.current?.show({
            severity: 'error',
            summary: 'Login Error',
            detail: message,
            life: 4000
        });
    };

    const showSuccess = (message: string) => {
        toast.current?.show({
            severity: 'success',
            summary: 'Welcome Back',
            detail: message,
            life: 2000
        });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim() || !password) {
            showError('Please provide both email and password.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                showError(data.error || 'Login failed. Please check your credentials.');
            } else {
                showSuccess('Login successful! Redirecting...');
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } catch (err) {
            showError('Network error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={containerClassName}>
            <Toast ref={toast} position="top-right" />

            <div className="flex flex-column align-items-center justify-content-center w-full max-w-30rem">
                <img src="/logo.png" alt="Nobodhara Aryan Society Logo" className="mb-4 w-6rem flex-shrink-0" />

                <div
                    className="w-full"
                    style={{
                        borderRadius: '28px',
                        padding: '0.25rem',
                        background: 'linear-gradient(180deg, var(--primary-color) 10%, rgba(33, 150, 243, 0) 40%)'
                    }}
                >
                    <div className="surface-card py-7 px-4 sm:px-6 shadow-4" style={{ borderRadius: '26px' }}>
                        <div className="text-center mb-5">
                            <div className="text-900 text-3xl font-bold mb-2">Sign In</div>
                            <span className="text-600 font-medium">Access your dashboard</span>
                        </div>

                        <form onSubmit={handleLogin} className="p-fluid">
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-900 font-medium mb-2">
                                    Email Address
                                </label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-envelope" />
                                    <InputText id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className="p-inputtext-lg" required />
                                </span>
                            </div>

                            <div className="mb-5">
                                <label htmlFor="password" className="block text-900 font-medium mb-2">
                                    Password
                                </label>
                                <span className="p-input-icon-left w-full">
                                    <i className="pi pi-lock z-2" />
                                    <Password inputId="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" toggleMask feedback={false} inputClassName="p-inputtext-lg w-full pl-5" required />
                                </span>
                            </div>

                            <Button label={loading ? 'Signing In...' : 'Sign In'} icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-sign-in'} className="w-full p-3 text-lg font-semibold border-round-xl" disabled={loading} type="submit" />
                        </form>

                        <div className="text-center mt-4 pt-3 border-top-1 surface-border">
                            <span className="text-600 font-medium mr-2">Don&apos;t have an account?</span>
                            <Link href="/auth/register" className="font-bold no-underline cursor-pointer text-primary">
                                Sign Up
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
