import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronsLeft, ChevronsRight, Home, LogOut, Mail, Users, UserPlus } from 'lucide-react';

/**
 * SidebarProps
 * @param email Email del usuario autenticado (se muestra en la parte superior)
 * @param userRoles Array de roles del usuario autenticado (para mostrar/ocultar opciones de administración)
 * @param onLogout Callback para ejecutar al hacer logout
 * @param onCreateUserClick Callback para abrir el modal de crear usuario
 * @param onRolesClick Callback para abrir el modal de gestión de roles
 * @param activeRoute (opcional) Ruta activa para resaltar el menú correspondiente
 */
export interface SidebarProps {
  email: string;
  userRoles: string[];
  onLogout: () => void;
  onCreateUserClick: () => void;
  onRolesClick: () => void;
  activeRoute?: string;
}

/**
 * Sidebar - Componente de barra lateral reutilizable y autocontenida.
 * 
 * - Muestra el email del usuario.
 * - Permite expandir/colapsar.
 * - Muestra opciones de administración según roles.
 * - Expone callbacks para acciones (logout, crear usuario, roles).
 * 
 * Ejemplo de uso:
 * <Sidebar
 *   email={user.email}
 *   userRoles={user.roles}
 *   onLogout={handleLogout}
 *   onCreateUserClick={() => setShowCreateUserModal(true)}
 *   onRolesClick={() => setShowRolesModal(true)}
 *   activeRoute="dashboard"
 * />
 */
export const Sidebar: React.FC<SidebarProps> = ({
  email,
  userRoles,
  onLogout,
  onCreateUserClick,
  onRolesClick,
  activeRoute,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [areAdminButtonsVisible, setAreAdminButtonsVisible] = useState(false);
  const router = useRouter();

  // Permiso para ver botones de administración
  const canSeeAdminButtons = userRoles.includes('superadmin') || userRoles.includes('contributor');
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // Handler para Dashboard: navega y cierra submenús
  const handleDashboardClick = () => {
    setAreAdminButtonsVisible(false);
    router.push('/');
  };

  return (
    <aside
      className={`sidebar transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-64' : 'w-20'} p-4 flex flex-col justify-between items-center`}
    >
      {/* Botón para expandir/colapsar */}
      <Button
        variant="ghost"
        className="absolute right-0 top-1/2 z-20 p-1 rounded-full bg-black/40 text-white hover:bg-[#017979] transform -translate-y-1/2"
        onClick={toggleSidebar}
        aria-label={isSidebarOpen ? 'Colapsar sidebar' : 'Expandir sidebar'}
      >
        {isSidebarOpen ? <ChevronsLeft className="h-5 w-5" /> : <ChevronsRight className="h-5 w-5" />}
      </Button>
      {/* Email del usuario */}
      <div className="flex flex-col items-center w-full mt-10">
        <div className="flex gap-2 items-center mb-8">
          {isSidebarOpen && (
            <span
              className="px-4 py-2 rounded-full font-semibold text-white bg-[#017979] shadow-lg border border-white heartbeat"
              style={{ boxShadow: '0 0 0 0 #017979' }}
            >
              {email || 'No email'}
            </span>
          )}
        </div>
        {/* Navegación principal */}
        <nav className="space-y-4 flex flex-col items-center w-full">
          {/* Dashboard */}
          <Button
            variant="ghost"
            className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/40 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979] ${activeRoute === 'dashboard' ? 'active' : ''}`}
            title="Dashboard"
            onClick={handleDashboardClick}
          >
            <Home className="h-5 w-5 flex-shrink-0 text-white" />
            {isSidebarOpen && (
              <span className="transition-all duration-300 ease-in-out overflow-hidden text-white">Dashboard</span>
            )}
          </Button>
          {/* Botón de administración (visible según roles) */}
          {canSeeAdminButtons && (
            <Button
              variant="ghost"
              className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979] ${activeRoute === 'user-management' ? 'active' : ''}`}
              title="Administrator User"
              onClick={() => setAreAdminButtonsVisible((v) => !v)}
              aria-expanded={areAdminButtonsVisible}
              aria-controls="sidebar-admin-buttons"
            >
              <Users className="h-5 w-5 flex-shrink-0 text-white" />
              {isSidebarOpen && (
                <span className="transition-all duration-300 ease-in-out overflow-hidden">
                  user management
                </span>
              )}
            </Button>
          )}
          {/* Submenú de administración */}
          {areAdminButtonsVisible && canSeeAdminButtons && (
            <div className="flex flex-col items-center w-full" id="sidebar-admin-buttons">
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979] ${activeRoute === 'create-user' ? 'active' : ''}`}
                title="Create User"
                onClick={onCreateUserClick}
              >
                <UserPlus className="h-5 w-5 flex-shrink-0 text-white" />
                {isSidebarOpen && (
                  <span className="transition-all duration-300 ease-in-out overflow-hidden">
                    Create User
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979] ${activeRoute === 'roles' ? 'active' : ''}`}
                title="Roles"
                onClick={onRolesClick}
              >
                <Users className="h-5 w-5 flex-shrink-0 text-white" />
                {isSidebarOpen && (
                  <span className="transition-all duration-300 ease-in-out overflow-hidden">
                   Roles
                  </span>
                )}
              </Button>
            </div>
          )}
          {/* Otros botones visibles para todos */}
          <Button
            variant="ghost"
            className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979] ${activeRoute === 'button1' ? 'active' : ''}`}
            title="Button 1"
          >
            <Mail className="h-5 w-5 flex-shrink-0 text-white" />
            {isSidebarOpen && (
              <span className="transition-all duration-300 ease-in-out overflow-hidden">
                Button 1
              </span>
            )}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start text-sm ${isSidebarOpen ? 'gap-2' : 'justify-center'} bg-black/60 group-hover:bg-transparent text-white p-2 rounded-md hover:bg-[#017979] ${activeRoute === 'button2' ? 'active' : ''}`}
            title="Button 2"
          >
            <Mail className="h-5 w-5 flex-shrink-0 text-white" />
            {isSidebarOpen && (
              <span className="transition-all duration-300 ease-in-out overflow-hidden">
                Button 2
              </span>
            )}
          </Button>
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
          <LogOut className="h-5 w-5 flex-shrink-0 text-white" />
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