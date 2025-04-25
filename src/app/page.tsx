'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { fetchWrapper } from "@/utils/fetchWrapper";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LayoutDashboard, LogOut, Mail, Menu } from 'lucide-react';
import { VideoBackground } from '@/components/background/video-background';

export default function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [userInitials, setUserInitials] = useState<string>('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const router = useRouter();

    const handleLogout = async () => {
        const accessToken = sessionStorage.getItem('accessToken');
        const refreshToken = sessionStorage.getItem('refreshToken');

        if (!accessToken || !refreshToken) {
            console.error('Access token or refresh token not found');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('refreshToken');
            sessionStorage.removeItem('username');
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
             console.log('Not authenticated during logout, redirecting to login.');
             sessionStorage.removeItem('accessToken');
             sessionStorage.removeItem('refreshToken');
             sessionStorage.removeItem('username');
             router.push('/login');
             return;
         }

        // Always clear session and redirect after attempting logout, regardless of API success
        console.log('Logout attempted. Clearing session and redirecting.');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('username');
        router.push('/login');

        // Optional: Log the actual API response status for debugging
        if (response && !response.ok) {
            const errorText = await response.text();
            console.warn('Logout API call failed:', response.status, errorText);
        }

        } catch (error) {
            console.error('Error during logout fetch operation:', error);
             // Fallback: Clear tokens and redirect on any fetch error
             sessionStorage.removeItem('accessToken');
             sessionStorage.removeItem('refreshToken');
             sessionStorage.removeItem('username');
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
        let username = sessionStorage.getItem('username'); // Get username from storage if available

        const checkAuth = async () => {
          try {
            // Make a lightweight authenticated request to check the token
            // *** IMPORTANT: Ensure this is the CORRECT endpoint to get user info ***
            const response = await fetchWrapper('https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/users/me');

            if (response && (response as any).error === 'not_authenticated') {
              console.log('Session invalid or expired. Redirecting to login.');
              sessionStorage.removeItem('accessToken');
              sessionStorage.removeItem('refreshToken');
              sessionStorage.removeItem('username');
              router.push('/login');
            } else if (response && response.ok) {
              // Token is valid (or was refreshed)
              const userData = await response.json();
              console.log('User authenticated:', userData);
              setIsAuthenticated(true);
              // Use username from API response if available, otherwise fallback to session storage
              const currentUsername = userData?.username || username;
              if (currentUsername) {
                setUserInitials(getUserInitials(currentUsername));
                 // Update username in session storage if it wasn't there or is different
                if (currentUsername !== username) {
                    sessionStorage.setItem('username', currentUsername);
                    username = currentUsername; // Update local variable too
                }
              } else {
                 console.warn("Username not found in API response or session storage.");
                 setUserInitials('??');
                 // Consider fetching username separately if needed and not present
              }

            } else {
               // Handle other API errors during auth check
               console.error('Authentication check failed:', response?.status);
               // Specific check for 404
               if (response?.status === 404) {
                 console.error(`Error 404: The endpoint 'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/users/me' was not found. Please verify the API endpoint for checking user authentication.`);
               }
               sessionStorage.removeItem('accessToken');
               sessionStorage.removeItem('refreshToken');
               sessionStorage.removeItem('username');
               router.push('/login');
            }
          } catch (error) {
             console.error('Error during authentication check fetch operation:', error);
             sessionStorage.removeItem('accessToken');
             sessionStorage.removeItem('refreshToken');
             sessionStorage.removeItem('username');
             router.push('/login');
           }
         };


        if (!token) {
            router.push('/login');
        } else {
             // If username exists in session, show initials immediately for better UX
            if (username) {
                setUserInitials(getUserInitials(username));
            }
            checkAuth(); // Then check authentication status
        }
    // Only run on initial mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isAuthenticated) {
        // Optionally show a loading state while checking auth
        return <div className="flex items-center justify-center min-h-screen"><p className="text-foreground z-10">Loading...</p></div>;
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            <VideoBackground />
            <div className="relative flex min-h-screen z-10"> {/* Ensure content is above background */}
                {/* Collapsible Sidebar */}
                 {/* Apply transition-all for smooth width change */}
                <aside className={`sidebar transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} p-4 flex flex-col justify-between items-center`}>
                    {/* Toggle Sidebar Button - Position adjusted for better visibility */}
                    <Button variant="ghost" className="absolute left-2 top-2 z-20 p-2 rounded-md bg-black/40 text-white hover:bg-black/60" onClick={toggleSidebar}>
                        <Menu className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col items-center w-full mt-10"> {/* Added margin-top */}
                        <Avatar className="mb-8 relative">
                             {/* Ensure fallback styles contrast with sidebar */}
                            <AvatarFallback className='text-primary-foreground bg-primary font-bold'>{userInitials}</AvatarFallback>
                        </Avatar>
                         {/* Navigation Items */}
                        <nav className="space-y-4 flex flex-col items-center w-full">
                            <Button variant="ghost" className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/40 hover:bg-black/50 text-white p-2 rounded-md`} title="Dashboard">
                                <LayoutDashboard className="h-5 w-5 flex-shrink-0 text-white" />
                                {isSidebarOpen && <span>Dashboard</span>}
                            </Button>
                            <Button variant="ghost" className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 hover:bg-black/50 text-white p-2 rounded-md`} title="Mail">
                                <Mail className="h-5 w-5 flex-shrink-0 text-white" />
                                {isSidebarOpen && <span>Mail</span>}
                            </Button>
                            {/* Add more navigation items here following the same pattern */}
                        </nav>
                    </div>
                    {/* Logout Button at the bottom */}
                    <div className='w-full flex justify-center mt-auto'> {/* mt-auto pushes it down */}
                        <Button
                            variant="ghost"
                            className={`w-full text-sm ${isSidebarOpen ? 'gap-2 justify-start' : 'justify-center'} bg-black/60 hover:bg-destructive/80 text-white p-2 rounded-md`}
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <LogOut className='h-5 w-5 flex-shrink-0 text-white' />
                            {isSidebarOpen && <span>Logout</span>}
                        </Button>
                    </div>
                </aside>
                {/* Main content area */}
                 {/* Ensure content area adapts and is scrollable */}
                <main className="flex-1 p-6 bg-background/80 backdrop-blur-sm overflow-y-auto">
                   <h1 className="text-2xl font-bold mb-4 text-foreground">Welcome to MiniHack Analyzer</h1>
                   <p className="text-muted-foreground">Your dashboard content goes here.</p>
                   {/* Add more dashboard components here */}
                </main>
            </div>
        </div>
    );
};
    