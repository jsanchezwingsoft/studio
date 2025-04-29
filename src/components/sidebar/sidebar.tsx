import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, Home, LogOut, Mail, Users, UserPlus, FlaskConical, Globe, Settings } from 'lucide-react';

export interface SidebarProps {
  email: string;
  userRoles: string[];
  onLogout: () => void;
  onCreateUserClick: () => void;
  onRolesClick: () => void;
  onShowUsersTable?: () => void;
  onShowScansTable?: () => void;
  onTestUrlClick?: () => void;
  activeRoute?: string;
  areAdminButtonsVisible: boolean;
  setAreAdminButtonsVisible: (visible: boolean) => void;
  areScansButtonsVisible: boolean;
  setAreScansButtonsVisible: (visible: boolean) => void;
  onDashboardClick: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  email,
  userRoles,
  onLogout,
  onCreateUserClick,
  onRolesClick,
  onShowUsersTable,
  onShowScansTable,
  onTestUrlClick,
  activeRoute,
  areAdminButtonsVisible,
  setAreAdminButtonsVisible,
  areScansButtonsVisible,
  setAreScansButtonsVisible,
  onDashboardClick,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const canSeeAdminButtons = userRoles.includes('superadmin') || userRoles.includes('contributor');
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleDashboardClick = () => {
    setAreAdminButtonsVisible(false);
    setAreScansButtonsVisible(false);
    onDashboardClick();
    router.push('/');
  };
  const handleUserManagementClick = () => {
    setAreAdminButtonsVisible((v) => !v);
    setAreScansButtonsVisible(false);
    if (onShowUsersTable) onShowUsersTable();
  };
  const handleScansClick = () => {
    setAreScansButtonsVisible((v) => !v);
    setAreAdminButtonsVisible(false);
    if (onShowScansTable) onShowScansTable();
  };

  // Close submenus if sidebar collapses
  useEffect(() => {
    if (!isSidebarOpen) {
      setAreAdminButtonsVisible(false);
      setAreScansButtonsVisible(false);
    }
  }, [isSidebarOpen, setAreAdminButtonsVisible, setAreScansButtonsVisible]);

  return (
    <aside
      className={`sidebar transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} p-4 flex flex-col justify-between items-center`}
    >
      {/* Botón para expandir/colapsar */}
      <Button
        variant="ghost"
        className="absolute right-0 top-1/2 z-20 p-1 rounded-full bg-black/40 text-white hover:bg-[#017979] transform -translate-y-1/2 translate-x-1/2"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? 'Colapsar sidebar' : 'Expandir sidebar'}
      >
        {isSidebarOpen ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
      </Button>
      {/* Email del usuario */}
      <div className="flex flex-col items-center w-full mt-10">
        <div className="flex gap-2 items-center mb-8 w-full justify-center">
          {isSidebarOpen ? (
            <span
              className="px-4 py-2 rounded-full font-semibold text-white bg-[#017979]/80 shadow-lg border border-primary/30 heartbeat max-w-full truncate"
              style={{ boxShadow: '0 0 0 0 #017979' }}
              title={email || 'No email'}
            >
              {email || 'No email'}
            </span>
          ) : (
             <div className="h-8 w-8 rounded-full bg-[#017979]/80 flex items-center justify-center text-white font-bold shadow-lg border border-primary/30 heartbeat">
               {email ? email[0].toUpperCase() : '?'}
             </div>
          )}
        </div>
        {/* Navegación principal */}
        <nav className="space-y-2 flex flex-col items-center w-full">
          {/* Dashboard */}
          <Button
            variant="ghost"
            className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/40 hover:bg-[#017979] text-white p-2 rounded-md ${activeRoute === 'dashboard' ? 'active' : ''}`}
            title="Dashboard"
            onClick={handleDashboardClick}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && (
              <span className="transition-opacity duration-300 ease-in-out overflow-hidden">Dashboard</span>
            )}
          </Button>
          {/* Botón de administración (visible según roles) */}
          {canSeeAdminButtons && (
            <Button
              variant="ghost"
              className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 hover:bg-[#017979] text-white p-2 rounded-md ${activeRoute === 'user-management' ? 'active' : ''}`}
              title="User Management"
              onClick={handleUserManagementClick}
              aria-expanded={areAdminButtonsVisible}
              aria-controls="sidebar-admin-buttons"
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              {isSidebarOpen && (
                <span className="transition-all duration-300 ease-in-out overflow-hidden">
                  User Management
                </span>
              )}
            </Button>
          )}
          {/* Submenú de administración */}
          {isSidebarOpen && areAdminButtonsVisible && canSeeAdminButtons && (
             <div className="pl-6 w-full space-y-1" id="sidebar-admin-buttons">
               <Button
                 variant="ghost"
                 className={`w-full justify-start text-xs gap-2 bg-black/30 hover:bg-[#017979]/70 text-white p-2 rounded-md ${activeRoute === 'create-user' ? 'active-sub' : ''}`}
                 title="Create User"
                 onClick={onCreateUserClick}
               >
                 <UserPlus className="h-4 w-4 flex-shrink-0" />
                 <span className="transition-all duration-300 ease-in-out overflow-hidden">
                   Create User
                 </span>
               </Button>
               <Button
                 variant="ghost"
                 className={`w-full justify-start text-xs gap-2 bg-black/30 hover:bg-[#017979]/70 text-white p-2 rounded-md ${activeRoute === 'roles' ? 'active-sub' : ''}`}
                 title="Roles Management"
                 onClick={onRolesClick}
               >
                 <Settings className="h-4 w-4 flex-shrink-0" />
                 <span className="transition-all duration-300 ease-in-out overflow-hidden">
                   Roles Management
                 </span>
               </Button>
             </div>
           )}
          {/* Botón SCANS */}
          <Button
            variant="ghost"
            className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 hover:bg-[#017979] text-white p-2 rounded-md ${activeRoute === 'scans' ? 'active' : ''}`}
            title="Scans"
            onClick={handleScansClick}
            aria-expanded={areScansButtonsVisible}
            aria-controls="sidebar-scans-buttons"
          >
            <FlaskConical className="h-5 w-5 flex-shrink-0" />
            {isSidebarOpen && (
              <span className="transition-all duration-300 ease-in-out overflow-hidden">
                Scans
              </span>
            )}
          </Button>
          {/* Submenú de SCANS */}
          {isSidebarOpen && areScansButtonsVisible && (
            <div className="pl-6 w-full space-y-1" id="sidebar-scans-buttons">
              <Button
                variant="ghost"
                className={`w-full justify-start text-xs gap-2 bg-black/30 hover:bg-[#017979]/70 text-white p-2 rounded-md ${activeRoute === 'enter-urls' ? 'active-sub' : ''}`}
                title="Enter URLs"
                onClick={onTestUrlClick}
              >
                <Globe className="h-4 w-4 flex-shrink-0" />
                <span className="transition-all duration-300 ease-in-out overflow-hidden">
                  Enter URLs
                </span>
              </Button>
               {/* Add other scan sub-options here if needed */}
            </div>
          )}
        </nav>
      </div>
      {/* Botón de logout */}
      <div className="w-full flex justify-center mt-auto">
        <Button
          variant="ghost"
          className={`w-full text-sm ${isSidebarOpen ? 'gap-2 justify-start' : 'justify-center'} bg-black/60 text-white p-2 rounded-md hover:bg-[#017979]`}
          onClick={onLogout}
          title="Logout"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {isSidebarOpen && (
            <span className="transition-all duration-300 ease-in-out overflow-hidden">
              Logout
            </span>
          )}
        </Button>
      </div>
    </aside>
  );
};