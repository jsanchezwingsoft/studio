'use client';
import React, { useEffect, useState } from 'react';
import EnterUrlsScan from '@/components/scans/EnterUrlsScan'; // Changed to default import
import { useRouter } from 'next/navigation';
import { fetchWrapper } from '@/utils/fetchWrapper';
import { Sidebar } from '@/components/sidebar/sidebar';
import { CreateUserForm } from '@/components/users/CreateUserForm';
import { RolesManager } from '@/components/users/RolesManager';
import { UsersTable } from '@/components/users/UsersTable';
import { Dialog } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { VideoBackground } from '@/components/background/video-background';
import { ScansHistoryTable } from '@/components/scans/ScansHistoryTable';

const HomePage = () => {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [showUsersTable, setShowUsersTable] = useState(false);
  const [showScansTable, setShowScansTable] = useState(false);
  const [isEnterUrlsModalOpen, setIsEnterUrlsModalOpen] = useState(false);
  const { toast } = useToast();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const router = useRouter();
  const isAuthenticated = isAuthenticatedState;

  // Logout handler
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
        // Check if response is an object and not Response to handle fetchWrapper error case
        if (response && typeof response === 'object' && 'error' in response) {
          console.warn('Logout API call might have failed, but proceeding with frontend logout:', response.error);
        } else if (response && response.ok) {
           console.log('Logout successful on backend');
        } else if (response) {
           console.warn('Logout API call failed with status:', response.status);
        }
      } catch (error) {
         console.error('Error during logout API call:', error);
        // No-op, ya redirigimos arriba
      }
    }
  };


  // Autenticación y roles
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('accessToken');
      const storedEmail = sessionStorage.getItem('email');
      const storedRoles = sessionStorage.getItem('roles');

      if (token) {
          // Verify token validity with the backend (optional but recommended)
          try {
              const response = await fetchWrapper('https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/auth/verify-token'); // Replace with your actual verify endpoint

              // Check if response is an object and has an error property
              if (response && typeof response === 'object' && 'error' in response) {
                 if (response.error === 'not_authenticated') {
                    console.log('Token invalid or expired, redirecting to login.');
                    handleLogout(); // Ensure clean logout if token is bad
                    return;
                 } else {
                    throw new Error(`Authentication check failed: ${response.error}`);
                 }
              } else if (!response || !response.ok) {
                 // Handle cases where response is not ok but not the specific 'error' object
                 const status = response ? response.status : 'unknown';
                 console.log(`Token verification failed with status ${status}, redirecting to login.`);
                 handleLogout(); // Ensure clean logout
                 return;
              }

              // If token is valid
              setIsAuthenticatedState(true);
              setEmail(storedEmail || '');
              if (storedRoles) {
                  setUserRoles(JSON.parse(storedRoles));
              }
          } catch (error) {
              console.error("Error during token verification:", error);
              handleLogout(); // Logout on any verification error
          }
      } else {
          console.log('No access token found, redirecting to login.');
          handleLogout(); // Ensure clean logout if no token
      }
  };

    checkAuth();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // Dependencies for useEffect

  // Handler para mostrar la tabla de usuarios
  const handleShowUsersTable = () => {
    setShowUsersTable(true);
    setShowScansTable(false);
  };

  // Handler para mostrar la tabla de historial de scans
  const handleShowScansTable = () => {
    setShowScansTable(true);
    setShowUsersTable(false);
  };

  // Handler para ir al Dashboard (oculta ambas tablas)
  const handleDashboard = () => {
    setShowUsersTable(false);
    setShowScansTable(false);
  };

  // Handler para mostrar el modal/drawer de Enter URLs
  const handleEnterUrlsClick = () => {
    setIsEnterUrlsModalOpen(true);
  };

  if (!isAuthenticated) {
    // Optional: Add a more sophisticated loading state or skeleton screen
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground z-10">Loading authentication...</p>
         {/* Consider adding a spinner or skeleton UI */}
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <VideoBackground />
      <div className="relative flex min-h-screen z-10">
        <Sidebar
          email={email}
          userRoles={userRoles}
          onLogout={handleLogout}
          onCreateUserClick={() => setIsModalOpen(true)}
          onRolesClick={() => setIsRolesModalOpen(true)}
          onShowUsersTable={handleShowUsersTable}
          onShowScansTable={handleShowScansTable}
          onTestUrlClick={handleEnterUrlsClick}
          activeRoute={
            showUsersTable
              ? 'user-management'
              : showScansTable
              ? 'scans'
              : 'dashboard'
          }
        />
        <main className="flex-1 p-6 bg-background/80 backdrop-blur-sm overflow-y-auto">
          {/* Conditional rendering based on state */}
           {!showUsersTable && !showScansTable && (
             <>
               <h1 className="text-2xl font-bold mb-4 text-foreground">Welcome to MiniHack Analyzer</h1>
               <p className="text-muted-foreground">Your dashboard content goes here.</p>
                {/* Add Dashboard specific components here */}
             </>
           )}
           {showUsersTable && (
             <div className="mt-8">
               <UsersTable />
             </div>
           )}
           {showScansTable && (
             <div className="mt-8">
                <ScansHistoryTable />
             </div>
           )}
        </main>
        {/* Modal para ingresar la URL y escanear */}
        <Dialog open={isEnterUrlsModalOpen} onOpenChange={setIsEnterUrlsModalOpen}>
          <EnterUrlsScan onClose={() => setIsEnterUrlsModalOpen(false)} />
        </Dialog>
        {/* Modal para crear usuario */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <CreateUserForm
            canCreateUsers={userRoles.includes('superadmin') || userRoles.includes('contributor')}
            onSuccessCallback={() => setIsModalOpen(false)}
            onCancel={() => setIsModalOpen(false)}
          />
        </Dialog>
        {/* Modal para gestión de roles */}
        <Dialog open={isRolesModalOpen} onOpenChange={setIsRolesModalOpen}>
          <RolesManager
            onSuccessCallback={() => setIsRolesModalOpen(false)}
            onCancel={() => setIsRolesModalOpen(false)}
          />
        </Dialog>
      </div>
    </div>
  );
};

export default HomePage;
