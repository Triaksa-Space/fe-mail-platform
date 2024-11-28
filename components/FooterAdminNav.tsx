import React from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { Settings, Plus, Database, LayoutGrid, ChevronUp, ChevronDown } from 'lucide-react'

const FooterAdminNav = () => {
    const router = useRouter();

    return (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
            <div className="container mx-auto flex justify-around py-4">
                <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => router.push('/admin')}>
                    <LayoutGrid className="h-5 w-5" />
                    <span className="text-xs">Dashboard</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => router.push('/admin/create-single-email')}>
                    <Plus className="h-5 w-5" />
                    <span className="text-xs">Create Single</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => router.push('/admin/create-bulk-email')}>
                    <Database className="h-5 w-5" />
                    <span className="text-xs">Create Bulk</span>
                </Button>
                <Button variant="ghost" className="flex flex-col items-center gap-1" onClick={() => router.push('/admin/settings')}>
                    <Settings className="h-5 w-5" />
                    <span className="text-xs">Settings</span>
                </Button>
            </div>
        </div>
    );
};

export default FooterAdminNav;