'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchWrapper } from '@/utils/fetchWrapper';
import { Sidebar } from '@/components/sidebar/sidebar';
import { CreateUserForm } from '@/components/users/CreateUserForm';
import { RolesManager } from '@/components/users/RolesManager';
import { UsersTable } from '@/components/users/UsersTable';
import { Dialog } from '@/components/ui/dialog';
import { VideoBackground } from '@/components/background/video-background';
import { useToast } from '@/hooks/use-toast';
import { ScansHistoryTable } from '@/components/scans/ScansHistoryTable'; // Nuevo import

const HomePage = () => {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [showUsersTable, setShowUsersTable] = useState(false);
  const [showScansTable, setShowScansTable] = useState(false); // Nuevo estado
  const { toast } = useToast();
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

  // Autenticación y roles
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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground z-10">Loading...</p>
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
          onShowScansTable={handleShowScansTable} // Nuevo prop
          activeRoute={
            showUsersTable
              ? 'user-management'
              : showScansTable
              ? 'scans'
              : 'dashboard'
          }
        />
        <main className="flex-1 p-6 bg-background/80 backdrop-blur-sm overflow-y-auto">
          <h1 className="text-2xl font-bold mb-4 text-foreground">Welcome to MiniHack Analyzer</h1>
          <p className="text-muted-foreground">Your dashboard content goes here.</p>
          {showUsersTable && (
            <div className="mt-8">
              <UsersTable />
            </div>
          )}
          {showScansTable && (
            <ScansHistoryTable />
          )}
        </main>
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