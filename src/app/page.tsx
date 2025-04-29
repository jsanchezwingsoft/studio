'use client';
import React, { useEffect, useState } from 'react';
import EnterUrlsScan from '@/components/scans/EnterUrlsScan';
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
  const [refreshScansTable, setRefreshScansTable] = useState(false);
  const [areAdminButtonsVisible, setAreAdminButtonsVisible] = useState(false);
  const [areScansButtonsVisible, setAreScansButtonsVisible] = useState(false);
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
        if (response && typeof response === 'object' && 'error' in response) {
          console.warn('Logout API call might have failed, but proceeding with frontend logout:', response.error);
        } else if (response && response.ok) {
           console.log('Logout successful on backend');
        } else if (response) {
           console.warn('Logout API call failed with status:', response.status);
        }
      } catch (error) {
         console.error('Error during logout API call:', error);
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
          try {
              setIsAuthenticatedState(true);
              setEmail(storedEmail || '');
              if (storedRoles) {
                  setUserRoles(JSON.parse(storedRoles));
              }
          } catch (error) {
              handleLogout();
          }
      } else {
          handleLogout();
      }
    };
    checkAuth();
  }, [router]);

  // Handler para mostrar la tabla de usuarios
  const handleShowUsersTable = () => {
    setShowUsersTable(true);
    setShowScansTable(false);
    setAreAdminButtonsVisible(true);
    setAreScansButtonsVisible(false);
  };

  // Handler para mostrar la tabla de historial de scans
  const handleShowScansTable = () => {
    setShowScansTable(true);
    setShowUsersTable(false);
    setAreAdminButtonsVisible(false);
    setAreScansButtonsVisible(true);
  };

  // Handler para ir al Dashboard (oculta ambas tablas)
  const handleDashboard = () => {
    setShowUsersTable(false);
    setShowScansTable(false);
    setAreAdminButtonsVisible(false);
    setAreScansButtonsVisible(false);
  };

  // Handler para mostrar el modal de Enter URLs
  const handleEnterUrlsClick = () => {
    setIsEnterUrlsModalOpen(true);
  };

  // Handler para refrescar la tabla de historial tras escanear
  const handleScanSuccess = () => {
    setRefreshScansTable((prev) => !prev);
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-foreground z-10">Loading authentication...</p>
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
          areAdminButtonsVisible={areAdminButtonsVisible}
          setAreAdminButtonsVisible={setAreAdminButtonsVisible}
          areScansButtonsVisible={areScansButtonsVisible}
          setAreScansButtonsVisible={setAreScansButtonsVisible}
          onDashboardClick={handleDashboard}
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
            <ScansHistoryTable refresh={refreshScansTable} />
          )}
        </main>
        {/* Modal para ingresar la URL y escanear */}
        <Dialog open={isEnterUrlsModalOpen} onOpenChange={setIsEnterUrlsModalOpen}>
          <EnterUrlsScan
            onClose={() => setIsEnterUrlsModalOpen(false)}
            onScanSuccess={handleScanSuccess}
          />
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