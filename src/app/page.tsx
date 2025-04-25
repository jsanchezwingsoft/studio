'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWrapper } from "@/utils/fetchWrapper";
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, Home, LogOut, Mail } from 'lucide-react';
import { VideoBackground } from '@/components/background/video-background';

export default function HomePage() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);   
    const [email, setEmail] = useState<string>(''); 
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();

    const handleLogout = async () => {
        const accessToken = sessionStorage.getItem('accessToken');
        const refreshToken = sessionStorage.getItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        setIsAuthenticated(false);
        sessionStorage.removeItem('email');
        if (!accessToken || !refreshToken) {
            router.push('/login');
        } else {
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
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        const storedEmail = sessionStorage.getItem('email');
        if (token) {
            setIsAuthenticated(true);
            setEmail(storedEmail || '');
        } else {
            setIsAuthenticated(false);
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('email');
            router.push('/login');
        }
    }, [router]);

    if (!isAuthenticated) {
        return <div className="flex items-center justify-center min-h-screen"><p className="text-foreground z-10">Loading...</p></div>;
    }

    // CSS para el efecto heartbeat (puedes moverlo a tu CSS global)
    const heartbeatStyle = `
    @keyframes heartbeat {
      0%, 100% {
        box-shadow: 0 0 0 0 #01797999, 0 0 0 0 #01797955;
      }
      40% {
        box-shadow: 0 0 0 8px #01797933, 0 0 0 16px #01797922;
      }
      60% {
        box-shadow: 0 0 0 4px #01797966, 0 0 0 8px #01797933;
      }
    }
    .heartbeat {
      animation: heartbeat 1.5s infinite;
    }
    `;

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {/* Inyecta el CSS para el efecto heartbeat */}
            <style>{heartbeatStyle}</style>
            <VideoBackground />
            <div className="relative flex min-h-screen z-10">
                <aside className={`sidebar transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} p-4 flex flex-col justify-between items-center`}>
                    <Button variant="ghost" className='absolute right-0 top-1/2 z-20 p-1 rounded-full bg-black/40 text-white hover:bg-[#017979] transform -translate-y-1/2' onClick={toggleSidebar}>
                        {isSidebarOpen ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
                    </Button>
                    <div className="flex flex-col items-center w-full mt-10">
                        <div className='flex gap-2 items-center mb-8'>
                            {isSidebarOpen && (
                                <span
                                    className='px-4 py-2 rounded-full font-semibold text-white bg-[#017979] shadow-lg border border-white heartbeat'
                                    style={{ boxShadow: '0 0 0 0 #017979' }}
                                >
                                    {email || 'No email'}
                                </span>
                            )}
                        </div>
                        <nav className="space-y-4 flex flex-col items-center w-full">
                            <Button variant="ghost" className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/40 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979]`} title="Dashboard">
                                <Home className="h-5 w-5 flex-shrink-0 text-white" />
                                {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden '>Dashboard</span>}
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