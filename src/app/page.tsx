'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { fetchWrapper } from "@/utils/fetchWrapper";
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; // Removed unused AvatarImage
import { LayoutDashboard, LogOut, Mail, Menu } from 'lucide-react';
import { VideoBackground } from '@/components/background/video-background'; // Import VideoBackground

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userInitials, setUserInitials] = useState<string>('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility
    const router = useRouter();

    const handleLogout = async () => {
        const accessToken = sessionStorage.getItem('accessToken');
        const refreshToken = sessionStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
            console.error('Access token or refresh token not found');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            router.push('/login'); // Redirect if tokens are missing
            return;
        }

        try {
            const response = await fetchWrapper(
            'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/auth/logout',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
               body: JSON.stringify({ refresh_token: refreshToken }),
               }

        );
        // Check for the special 'not_authenticated' error from fetchWrapper
        if (response && (response as any).error === 'not_authenticated') {
             console.log('Not authenticated, redirecting to login.');
             sessionStorage.removeItem('accessToken');
             sessionStorage.removeItem('refreshToken');
             router.push('/login');
             return;
         }

        // Check if fetch itself was successful (response exists and has ok status)
        if (response && response.ok) {
             console.log('Logout successful.');
             sessionStorage.removeItem('accessToken');
             sessionStorage.removeItem('refreshToken');
             router.push('/login');
         } else {
            // Handle potential errors from the fetch response itself
            const errorText = response ? await response.text() : 'No response from server';
            console.error('Logout failed:', response?.status, errorText);
            // Optionally, inform the user about the failure
            // You might want to still clear tokens and redirect, or let the user stay
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            router.push('/login'); // Force redirect even on logout API failure
         }
        } catch (error) {
            console.error('Error during logout fetch operation:', error);
             // Fallback: Clear tokens and redirect on any fetch error
             sessionStorage.removeItem('accessToken');
             sessionStorage.removeItem('refreshToken');
             router.push('/login');
        }
    };
    const getUserInitials = (username: string | null) => {
        if (!username) {
            return '??'; // Return placeholder if username is null
        }
        const names = username.split(' ');
        const initials = names.map(name => name.charAt(0).toUpperCase()).join('');
        return initials.substring(0, 2);
    };
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    useEffect(() => {
        const token = sessionStorage.getItem('accessToken');
        const username = sessionStorage.getItem('username'); // Get username from storage

        // Use fetchWrapper to validate token and potentially refresh it
        const checkAuth = async () => {
          try {
            // Make a lightweight authenticated request to check the token
            const response = await fetchWrapper('https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/users/me'); // Example endpoint

            if (response && (response as any).error === 'not_authenticated') {
              console.log('Session invalid or expired. Redirecting to login.');
              router.push('/login');
            } else if (response && response.ok) {
              // Token is valid (or was refreshed)
              const userData = await response.json();
              console.log('User authenticated:', userData);
              setIsAuthenticated(true);
              // Use username from API response if available, otherwise fallback to session storage
              const currentUsername = userData?.username || username;
              setUserInitials(getUserInitials(currentUsername));
              // Optionally update username in session storage if it was missing or different
              if (currentUsername && currentUsername !== username) {
                sessionStorage.setItem('username', currentUsername);
              }
            } else {
               // Handle other API errors during auth check
               console.error('Authentication check failed:', response?.status);
               sessionStorage.removeItem('accessToken');
               sessionStorage.removeItem('refreshToken');
               router.push('/login');
            }
          } catch (error) {
             console.error('Error during authentication check:', error);
             sessionStorage.removeItem('accessToken');
             sessionStorage.removeItem('refreshToken');
             router.push('/login');
           }
         };


        if (!token) {
            router.push('/login');
        } else {
            checkAuth(); // Check authentication status
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router]); // Removed username from dependencies as it's fetched or checked inside

    if (!isAuthenticated) {
        // Optionally show a loading state while checking auth
        return <div className="flex items-center justify-center min-h-screen"><VideoBackground /><p className="text-foreground z-10">Loading...</p></div>;
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <VideoBackground />
            <div className="relative flex min-h-screen z-10"> {/* Ensure content is above background */}
                {/* Collapsible Sidebar */}
                <aside className={`sidebar transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} p-4 flex flex-col justify-between items-center`}>
                     {/* Toggle Sidebar Button - Position adjusted for better visibility */}
                    <Button variant="ghost" className="absolute left-2 top-2 z-20 p-2 rounded-md bg-black/40 text-white hover:bg-black/60" onClick={toggleSidebar}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col items-center w-full mt-10"> {/* Added margin-top */}
                        <Avatar className="mb-8 relative">
                            <AvatarFallback className='text-white bg-primary'>{userInitials}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-4 flex flex-col items-center w-full">
                        {isSidebarOpen && (
                            <> {/* Correctly closed fragment */}
                                <Button variant="ghost" className="bg-black/40 hover:bg-black/50 font-medium flex items-center gap-2 text-white p-2 rounded-md w-full justify-start text-sm">
                                    <LayoutDashboard className="h-5 w-5 text-white" />
                                    Dashboard
                                </Button>
                                <Button variant="ghost" className="bg-black/60 hover:bg-black/50 flex items-center gap-2 text-white p-2 rounded-md w-full justify-start text-sm">
                                    <Mail className="h-5 w-5 text-white" />
                                    Mail
                                </Button>
                            </>
                        )}
                        {!isSidebarOpen && ( // Show icons only when collapsed
                           <>
                             <Button variant="ghost" className="bg-black/40 hover:bg-black/50 p-2 rounded-md" title="Dashboard">
                               <LayoutDashboard className="h-5 w-5 text-white" />
                             </Button>
                             <Button variant="ghost" className="bg-black/60 hover:bg-black/50 p-2 rounded-md" title="Mail">
                               <Mail className="h-5 w-5 text-white" />
                             </Button>
                           </>
                         )}
                        </div>
                    </div>
                    <div className='w-full flex justify-center'>
                        <Button
                            variant="ghost"
                            className="bg-black/60 hover:bg-destructive/80 flex items-center gap-2 text-white p-2 rounded-md w-full justify-center text-sm"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className='h-5 w-5 text-white' />
                            {isSidebarOpen && "Logout"} {/* Show text only when open */}
                        </Button>
                    </div>
                </aside>
                {/* Main content area */}
                <main className="flex-1 p-6 bg-background/80 backdrop-blur-sm overflow-auto"> {/* Added background and blur */}
                   <h1 className="text-2xl font-bold mb-4 text-foreground">Welcome to MiniHack Analyzer</h1>
                   <p className="text-muted-foreground">Your dashboard content goes here.</p>
                   {/* Add more dashboard components here */}
                </main>
            </div>
        </div>
    );
};

    