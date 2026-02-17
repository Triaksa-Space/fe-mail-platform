'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from 'axios';
import DOMPurify from 'dompurify';
import { useRouter } from "next/navigation";
import { UserPlus } from 'lucide-react';
import { ArrowLeftIcon, ChevronRightIcon, KeyIcon } from '@heroicons/react/24/outline';
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/useAuthStore";
import { AdminLayout, RolePermissionDropdown } from "@/components/admin";
import LoadingProcessingPage from '@/components/ProcessLoading';
import { PermissionKey } from "@/lib/admin-types";
import { Button } from "@/components/ui/button";

const CreateAdminPageContent: React.FC = () => {
    const router = useRouter();
    const roleId = useAuthStore((state) => state.roleId);
    const [authLoaded, setAuthLoaded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [permissions, setPermissions] = useState<PermissionKey[]>([]);
    const [usernameError, setUsernameError] = useState(false);

    useEffect(() => {
        document.title = "Create Admin - Admin Mailria";
        setAuthLoaded(true);
    }, []);

    useEffect(() => {
        if (!authLoaded) return;

        const storedToken = useAuthStore.getState().getStoredToken();
        if (!storedToken) {
            router.replace("/");
            return;
        }

        if (roleId !== 0) {
            router.replace("/admin");
        }
    }, [authLoaded, roleId, router]);

    const handleCreateAdmin = async () => {
        setUsernameError(false);

        if (!username.trim()) {
            setUsernameError(true);
            return;
        }

        if (!password || password.length < 6) {
            return;
        }

        if (permissions.length === 0) {
            return;
        }

        try {
            setIsLoading(true);
            const createdUsername = username.trim();
            await apiClient.post("/admin/admins", {
                username: createdUsername,
                password,
                permissions,
            });

            router.push(`/admin/roles?created=${encodeURIComponent(createdUsername)}`);
        } catch (error) {
            console.error('Failed to create admin:', error);

            let errorMessage = "";
            if (axios.isAxiosError(error)) {
                const rawError = error.response?.data?.error;
                const apiMessage =
                    error.response?.data?.message ||
                    (typeof rawError === "string" ? rawError : undefined) ||
                    error.response?.data?.error?.message;
                if (apiMessage) {
                    errorMessage = apiMessage;
                }
            }

            if (errorMessage === "Username already exists" || errorMessage === "User already registered.") {
                setUsernameError(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const canCreate = username.trim() && password.length >= 6 && permissions.length > 0;

    return (
        <AdminLayout>
            <div className="inline-flex flex-col justify-start items-start gap-5 w-full">
                <div className="h-5 inline-flex justify-start items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/admin/roles")}
                        className="w-8 h-8 p-1 rounded flex justify-center items-center gap-1 overflow-hidden hover:bg-neutral-100 transition-colors h-auto"
                    >
                        <ArrowLeftIcon className="w-5 h-5 text-neutral-600" />
                    </Button>
                    <ChevronRightIcon className="w-5 h-5 text-neutral-300" />
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/admin/roles")}
                        className="flex justify-center items-center gap-1 hover:bg-neutral-100 rounded px-1 transition-colors h-auto"
                    >
                        <KeyIcon className="w-5 h-5 text-neutral-600" />
                        <span className="text-neutral-600 text-sm font-normal font-['Roboto'] leading-4">Roles & permissions</span>
                    </Button>
                    <ChevronRightIcon className="w-5 h-5 text-neutral-300" />
                    <div className="flex justify-center items-center gap-1">
                        <UserPlus className="w-5 h-5 text-primary-500" />
                        <span className="text-primary-500 text-sm font-normal font-['Roboto'] leading-4">Create admin</span>
                    </div>
                </div>

                <div className="self-stretch inline-flex justify-start items-center gap-5">
                    <div className="justify-center text-neutral-800 text-2xl font-semibold font-['Roboto'] leading-8">
                        Create admin
                    </div>
                </div>

                <div className="self-stretch p-4 bg-white rounded-lg shadow-[0px_6px_15px_-2px_rgba(16,24,40,0.08)] flex flex-col justify-start items-start gap-4 overflow-visible">
                    <div className="self-stretch inline-flex justify-start items-start gap-4">
                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch relative flex flex-col justify-start items-start">
                                <div className="self-stretch h-3.5"></div>
                                <div className={`self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] inline-flex justify-start items-center gap-3 overflow-hidden ${usernameError ? "outline-red-500" : "outline-neutral-200"}`}>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const sanitizedValue = DOMPurify.sanitize(value).replace(/[^a-zA-Z0-9_]/g, '');
                                            setUsername(sanitizedValue);
                                            if (usernameError) {
                                                setUsernameError(false);
                                            }
                                        }}
                                        placeholder="Insert username"
                                        className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                                    />
                                </div>
                                <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                    <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Username</span>
                                </div>
                            </div>
                            {usernameError && (
                                <p className="text-xs text-red-500">User already registered.</p>
                            )}
                        </div>

                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch relative flex flex-col justify-start items-start">
                                <div className="self-stretch h-3.5"></div>
                                <div className="self-stretch h-10 px-3 py-2 bg-white rounded-lg shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] outline outline-1 outline-offset-[-1px] outline-neutral-200 inline-flex justify-start items-center gap-3 overflow-hidden">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            const sanitizedValue = DOMPurify.sanitize(value).replace(/\s/g, '');
                                            setPassword(sanitizedValue);
                                        }}
                                        placeholder="Insert password"
                                        className="flex-1 bg-transparent border-none outline-none text-neutral-800 text-sm font-normal font-['Roboto'] leading-4 placeholder:text-neutral-200"
                                    />
                                </div>
                                <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5">
                                    <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Password</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 inline-flex flex-col justify-start items-start gap-2">
                            <div className="self-stretch relative flex flex-col justify-start items-start">
                                <div className="self-stretch h-3.5"></div>
                                <RolePermissionDropdown
                                    value={permissions}
                                    onChange={(values) => setPermissions(values as PermissionKey[])}
                                />
                                <div className="px-1 left-[8px] top-1.5 absolute bg-white inline-flex justify-center items-center gap-2.5 z-10">
                                    <span className="text-neutral-800 text-[10px] font-normal font-['Roboto'] leading-4">Role</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.5px] outline-neutral-300"></div>

                    <div className="self-stretch flex flex-col justify-start items-end gap-2.5">
                        <Button
                            onClick={handleCreateAdmin}
                            disabled={!canCreate}
                            className="h-10 px-4 py-2.5 btn-primary-skin inline-flex justify-center items-center gap-1.5 transition-colors"
                        >
                            <UserPlus className="w-5 h-5 text-white" />
                            <span className="text-center text-white text-base font-medium font-['Roboto'] leading-4">Create admin</span>
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading && <LoadingProcessingPage />}
        </AdminLayout>
    );
};

const CreateAdminPage: React.FC = () => {
    return (
        <Suspense fallback={<div></div>}>
            <CreateAdminPageContent />
        </Suspense>
    );
};

export default CreateAdminPage;
