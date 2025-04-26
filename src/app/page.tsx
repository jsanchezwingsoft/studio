'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWrapper } from '@/utils/fetchWrapper';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, Home, LogOut, Mail, Users, UserPlus } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VideoBackground } from '@/components/background/video-background';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const HomePage = () => {
    const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [userRoles, setUserRoles] = useState<string[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const { toast } = useToast();
    const [areAdminButtonsVisible, setAreAdminButtonsVisible] = useState(false);
    const router = useRouter();
    const isAuthenticated = isAuthenticatedState;

    const handleLogout = async () => {
        const accessToken = sessionStorage.getItem('accessToken');
        const refreshToken = sessionStorage.getItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        setIsAuthenticatedState(false);
        sessionStorage.removeItem('email');
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('roles');
        router.push('/login');
        if (accessToken && refreshToken) {
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
            } catch (error) {
                // No-op, ya redirigimos arriba
            }
        }
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        const storedEmail = sessionStorage.getItem('email');
        const storedRoles = sessionStorage.getItem('roles');
        if (token) {
            setIsAuthenticatedState(true);
            setEmail(storedEmail || '');
            if (storedRoles) {
                setUserRoles(JSON.parse(storedRoles));
            }
        } else {
            setIsAuthenticatedState(false);
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('email');
            sessionStorage.removeItem('username');
            sessionStorage.removeItem('roles');
            router.push('/login');
        }
    }, [router]);

    const canCreateUsers = userRoles.includes('superadmin') || userRoles.includes('contributor');
    useEffect(() => {
        if (!canCreateUsers) {
            setAreAdminButtonsVisible(false);
        }
    }, [canCreateUsers]);

    const handleCreateUser = async () => {
        setIsModalOpen(false);
        try {
            const user = {
                username: newUsername,
                email: newEmail,
                password: newPassword,
                phone: newPhone,
            };
            if (!canCreateUsers) {
                toast({
                    variant: "destructive",
                    title: "Sin permisos",
                    description: "No tienes permisos para crear usuarios.",
                });
                return;
            }
            const response = await fetchWrapper('https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/users/',
                {
                    method: 'POST',
                    // PASA EL OBJETO, NO JSON.stringify
                    body: user,
                }
            );
            if (response.status >= 200 && response.status < 300) {
                const data = await response.json();
                toast({
                    variant: "success",
                    title: "Usuario creado con éxito",
                    description: (
                        <Alert className='flex gap-2'>
                            <div className='flex flex-col'>
                                <AlertTitle>Usuario</AlertTitle>
                                <AlertDescription>{data.username}</AlertDescription>
                            </div>
                            <div className='flex flex-col'>
                                <AlertTitle>Email</AlertTitle>
                                <AlertDescription>{data.email}</AlertDescription>
                            </div>
                        </Alert>
                    ),
                });
                // Limpia los campos del modal
                setNewUsername('');
                setNewEmail('');
                setNewPassword('');
                setNewPhone('');
            } else {
                const errorData = await response.json()
                toast({
                    variant: "destructive",
                    title: "Error al crear el usuario",
                    description: errorData.message || "Error inesperado.",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error al crear el usuario",
                description: "Error inesperado.",
            });
            console.error("Error inesperado:", error)
        }
    };

    if (!isAuthenticated) {
        return <div className="flex items-center justify-center min-h-screen"><p className="text-foreground z-10">Loading...</p></div>;
    }

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

    const canSeeAdminButtons = userRoles.includes('superadmin') || userRoles.includes('contributor');

    return (
        <div className="relative h-screen w-screen overflow-hidden">
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
                                {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden'>Dashboard</span>}
                            </Button>
                            {canSeeAdminButtons && (
                                <Button 
                                    variant="ghost"
                                    className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979]`}
                                    title="Administrator User"
                                    onClick={() => setAreAdminButtonsVisible(!areAdminButtonsVisible)}
                                >
                                    <Users className="h-5 w-5 flex-shrink-0 text-white"/>
                                    {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden'>Administrator User</span>}                                  
                                </Button>
                            )}
                            {areAdminButtonsVisible && canSeeAdminButtons &&  (
                                <div className="flex flex-col items-center w-full">
                                   <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                        <DialogTrigger asChild>
                                                <Button variant="ghost" className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979]`} title="Create User">
                                                    <UserPlus className="h-5 w-5 flex-shrink-0 text-white"/>
                                                    {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden'>Create User</span>}
                                                </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                            <DialogTitle>Crear nuevo usuario</DialogTitle>
                                            <DialogDescription>
                                               Introduce los datos del nuevo usuario:
                                            </DialogDescription>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Input id="name" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} className="col-span-4" type="text" placeholder="Username" />
                                                    <Input id="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="col-span-4" type="email" placeholder="Email" />
                                                    <Input id="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-4" type="password" placeholder="Password" />
                                                    <Input id="phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} className="col-span-4" type="text" placeholder="Phone" />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button type="submit" onClick={handleCreateUser}>
                                                   Crear
                                                </Button>
                                                <Button type="button" variant="secondary" onClick={() => {
                                                    setIsModalOpen(false);
                                                    setNewUsername('');
                                                    setNewEmail('');
                                                    setNewPassword('');
                                                    setNewPhone('');
                                                }}>
                                                    Cancelar
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                    <Button variant="ghost" className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979]`} title="Roles">
                                        <Users className="h-5 w-5 flex-shrink-0 text-white"/>
                                        {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden'>Roles</span>}
                                    </Button>
                                </div>
                            )}
                            {/* Otros botones visibles para todos */}
                            <Button variant="ghost" className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979]`} title="Button 1">
                                <Mail className="h-5 w-5 flex-shrink-0 text-white" />
                                {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden'>Button 1</span>}                                
                            </Button>
                            <Button variant="ghost" className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979]`} title="Button 2">
                                <Mail className="h-5 w-5 flex-shrink-0 text-white"/>
                                {isSidebarOpen && <span className='transition-all duration-300 ease-in-out overflow-hidden'>Button 2</span>}
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
export default HomePage;