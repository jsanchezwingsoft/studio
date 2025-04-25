'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { fetchWrapper } from "@/utils/fetchWrapper";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Headphones, LayoutDashboard, LogOut, Mail } from 'lucide-react';

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const router = useRouter();

    const handleLogout = async () => {
        const accessToken = sessionStorage.getItem('accessToken');
        const refreshToken = sessionStorage.getItem('refreshToken');
        if (!accessToken || !refreshToken) {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            router.push('/login');
            return;
        }
        const response = await fetchWrapper(
            'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/auth/logout',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            }
        );
        if (response && (response as any).error === 'not_authenticated') {
            router.push('/login');
            return;
        }
        if (response && response.ok) {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            router.push('/login');
        } else {
            console.error('Logout failed');
        }
    };

    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        if (!token) {
            router.push('/login');
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <div className="relative flex min-h-screen ">
                <aside className="w-20 bg-black/80 p-4 flex flex-col justify-between items-center">
                    <div className="flex flex-col items-center w-full">
                        <Avatar className="mb-8">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="space-y-4 flex flex-col items-center w-full">
                            <Button variant="ghost" className="bg-black/40 font-medium flex items-center gap-2 text-white p-2 rounded-md w-full justify-start text-sm">
                                <LayoutDashboard className="h-6 w-6 text-white" />
                                Dashboard
                            </Button>
                            <Button variant="ghost" className="bg-black/60 hover:bg-black/40 flex items-center gap-2 text-white p-2 rounded-md w-full justify-start text-sm">
                                <Mail className="h-6 w-6 text-white" />
                                Mail
                            </Button>
                        </div>
                    </div>
                    <div className='w-full flex justify-center'>
                        <Button
                            variant="ghost"
                            className="bg-black/60 hover:bg-black/40 flex items-center gap-2 text-white p-2 rounded-md w-full justify-center text-sm"
                            onClick={handleLogout}>
                            <LogOut className='h-6 w-6 text-white' />Logout
                        </Button>
                    </div>
                </aside>
            </div>
        </div>
    );
};