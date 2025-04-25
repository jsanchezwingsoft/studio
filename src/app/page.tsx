'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { fetchWrapper, isAuthenticated } from "@/utils/fetchWrapper";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronsLeft, ChevronsRight, Home, LogOut, Mail, Menu } from 'lucide-react';
import { VideoBackground } from '@/components/background/video-background';

export default function HomePage() {
    const [isAuthenticatedState, setIsAuthenticated] = useState<boolean>(false);
    const [userInitials, setUserInitials] = useState<string>('');
    const [username, setUsername] = useState<string | null>('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();

    const handleLogout = async () => {
        const accessToken = sessionStorage.getItem('accessToken');
        const refreshToken = sessionStorage.getItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        sessionStorage.removeItem('username');
        if (!accessToken || !refreshToken) {
            router.push('/login');
            return;
        }
        try {
            await fetchWrapper(
                'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/auth/logout',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                }
            );
            setIsAuthenticated(false);
            router.push('/login');
        } catch (error) {
            setIsAuthenticated(false);
            router.push('/login');
        }
    };

    const getUserInitials = (username: string | null) => {
        if (!username) {
            return '??';
        }
        const names = username.split(' ');
        const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
        return initials.substring(0, 2);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        let storedUsername = sessionStorage.getItem('username');
        const token = sessionStorage.getItem('accessToken');
        // Si no hay token o no es válido, redirige
        if (!token || !isAuthenticated(token)) {
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            setIsAuthenticated(false);
            sessionStorage.removeItem('username');
            router.push('/login');
            return;
        }
        // Si hay username en storage, muestra iniciales
        if (storedUsername) {
            setUserInitials(getUserInitials(storedUsername));
            setUsername(storedUsername);
        }
        // Si quieres obtener el username de otra fuente, hazlo aquí (por ejemplo, decodificando el JWT)
        setIsAuthenticated(true);
    }, [router]);

    if (!isAuthenticatedState) {
        return <div className="flex items-center justify-center min-h-screen"><p className="text-foreground z-10">Loading...</p></div>;
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <VideoBackground />
            <div className="relative flex min-h-screen z-10">
                <aside className={`sidebar transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} p-4 flex flex-col justify-between items-center`}>
                    <Button variant="ghost" className='absolute right-0 top-1/2 z-20 p-1 rounded-full bg-black/40 text-white hover:bg-[#017979] transform -translate-y-1/2' onClick={toggleSidebar}>
                        {isSidebarOpen ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
                    </Button>
                    <div className="flex flex-col items-center w-full mt-10">
                        <Avatar className="mb-8 relative">
                            <AvatarFallback className='text-primary-foreground bg-primary font-bold'>{userInitials}</AvatarFallback>
                            {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden text-white'>{username}</span>}
                        </Avatar>
                        <nav className="space-y-4 flex flex-col items-center w-full">
                            <Button variant="ghost" className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/40 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979]`} title="Dashboard">
                                <Home className="h-5 w-5 flex-shrink-0 text-white" />
                                {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden'>Dashboard</span>}
                            </Button>
                            <Button variant="ghost" className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979]`} title="Mail">
                                <Mail className="h-5 w-5 flex-shrink-0 text-white"/>
                                {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden'>Mail</span>}
                            </Button>
                        </nav>
                    </div>
                    <div className='w-full flex justify-center mt-auto'>
                        <Button
                            variant="ghost"
                            className={`w-full text-sm ${isSidebarOpen ? 'gap-2 justify-start' : 'justify-center'} bg-black/60 text-white p-2 rounded-md hover:bg-[#017979]`}
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className='h-5 w-5 flex-shrink-0 text-white' />
                            {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden'>Logout</span>}
                        </Button>
                    </div>
                </aside>
                <main className="flex-1 p-6 bg-background/80 backdrop-blur-sm overflow-y-auto">
                   <h1 className="text-2xl font-bold mb-4 text-foreground">Welcome to MiniHack Analyzer</h1>
                   <p className="text-muted-foreground">Your dashboard content goes here.</p>
                </main>
            </div>
        </div>
    );
};