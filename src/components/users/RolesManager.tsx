import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { XCircle } from 'lucide-react';
import { fetchWrapper } from '@/utils/fetchWrapper';
import { useToast } from '@/hooks/use-toast';

/**
 * Props para RolesManager
 * @param onSuccessCallback Callback al asignar/desasignar rol exitosamente
 * @param onCancel Callback para cancelar/cerrar
 */
export interface RolesManagerProps {
  onSuccessCallback?: () => void;
  onCancel?: () => void;
}

/**
 * Componente modular y reutilizable para gestión de roles de usuario.
 * - Maneja su propio estado y validaciones.
 * - Realiza llamadas a la API para asignar/desasignar roles.
 * - Muestra notificaciones y feedback.
 * - Puede ser usado en modales, páginas, etc.
 */
export const RolesManager: React.FC<RolesManagerProps> = ({
  onSuccessCallback,
  onCancel,
}) => {
  const [users, setUsers] = useState<{ user_id: string, username: string, roles: string[] }[]>([]);
  const [roles, setRoles] = useState<{ role_id: string, role_name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<{ user_id: string, role_name: string } | null>(null);
  const { toast } = useToast();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users and roles
  const fetchUsersAndRoles = async () => {
    try {
      setRefreshing(true);
      const usersResponse = await fetchWrapper(
        'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/users/list-with-roles',
        { method: 'GET' }
      );
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }
      const rolesResponse = await fetchWrapper(
        'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/roles/list',
        { method: 'GET' }
      );
      if (rolesResponse.ok) {
        const rolesData = await rolesResponse.json();
        setRoles(rolesData);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al obtener usuarios o roles",
        description: "No se pudo cargar la información necesaria.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
    const intervalId = setInterval(fetchUsersAndRoles, 5000); // Actualiza cada 5 segundos
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAssignRole = async () => {
    if (!selectedUserId || !selectedRoleId) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Debes seleccionar un usuario y un rol.",
      });
      return;
    }
    try {
      const response = await fetchWrapper(
        'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/roles/assign',
        {
          method: 'POST',
          body: {
            user_id: selectedUserId,
            role_id: selectedRoleId,
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        const data = await response.json();
        toast({
          variant: "success",
          title: "Rol asignado con éxito",
          description: (
            <Alert className='flex gap-2'>
              <div className='flex flex-col'>
                <AlertTitle>Usuario</AlertTitle>
                <AlertDescription>{data.user_id}</AlertDescription>
              </div>
              <div className='flex flex-col'>
                <AlertTitle>Rol</AlertTitle>
                <AlertDescription>{data.role_id}</AlertDescription>
              </div>
            </Alert>
          ),
        });
        setSelectedUserId('');
        setSelectedRoleId('');
        fetchUsersAndRoles();
        if (onSuccessCallback) onSuccessCallback();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error al asignar rol",
          description: errorData.detail || "Error inesperado.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al asignar rol",
        description: "Error inesperado.",
      });
    }
  };

  // Desasignar rol con confirmación
  const confirmRemoveRole = async () => {
    if (!confirmRemove) return;
    const { user_id, role_name } = confirmRemove;
    const role = roles.find(r => r.role_name === role_name);
    if (!role) return;
    try {
      const response = await fetchWrapper(
        'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/roles/remove',
        {
          method: 'DELETE',
          body: {
            user_id,
            role_id: role.role_id,
          },
        }
      );
      if (response.status >= 200 && response.status < 300) {
        toast({
          variant: "success",
          title: "Rol desasignado con éxito",
          description: `Rol ${role_name} desasignado del usuario.`,
        });
        fetchUsersAndRoles();
        if (onSuccessCallback) onSuccessCallback();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error al desasignar rol",
          description: errorData.detail || "Error inesperado.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al desasignar rol",
        description: "Error inesperado.",
      });
    }
    setConfirmRemove(null);
  };

  // Filtro de usuarios por búsqueda
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const paginatedFilteredUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  return (
    <DialogContent className="sm:max-w-[900px]">
      <DialogHeader>
        <DialogTitle>Asignar/Desasignar Rol a Usuario</DialogTitle>
        <DialogDescription>
          Busca, selecciona y asigna o desasigna un rol a un usuario.
        </DialogDescription>
      </DialogHeader>
      <div className="mb-2">
        <Input
          type="text"
          placeholder="Buscar usuario por nombre..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full"
        />
      </div>
      <div className="overflow-x-auto relative">
        {refreshing && (
          <div className="absolute right-2 top-2 text-xs text-[#017979] animate-pulse z-10">
            Actualizando...
          </div>
        )}
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border text-black">Seleccionar</th>
              <th className="p-2 border text-black">Usuario</th>
              <th className="p-2 border text-black">ID</th>
              <th className="p-2 border text-black">Roles actuales</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFilteredUsers.map(user => (
              <tr key={user.user_id} className='hover:bg-gray-200'>
                <td className="p-2 border text-center">
                  <input
                    type="radio"
                    name="selectedUser"
                    checked={selectedUserId === user.user_id}
                    onChange={() => setSelectedUserId(user.user_id)}
                  />
                </td>
                <td className="p-2 border font-medium">{user.username}</td>
                <td className="p-2 border text-xs text-gray-500">{user.user_id}</td>
                <td className="p-2 border">
                  {user.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map(role => (
                        <span key={role} className="inline-flex items-center px-2 py-1 rounded bg-[#017979] text-white text-xs font-semibold gap-1">
                          {role}
                          <button
                            type="button"
                            className="ml-1 text-white hover:text-red-400"
                            title={`Desasignar rol ${role}`}
                            onClick={() => setConfirmRemove({ user_id: user.user_id, role_name: role })}
                          >
                            <XCircle className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">Sin roles</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Paginado */}
        <div className="flex justify-center gap-2 mt-2">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</Button>
          <span>Página {currentPage}</span>
          <Button disabled={currentPage * usersPerPage >= filteredUsers.length} onClick={() => setCurrentPage(currentPage + 1)}>Siguiente</Button>
        </div>
      </div>
      {/* Select de roles */}
      <div className="mt-4">
        <label className="block mb-1 text-sm font-medium text-gray-700">Selecciona un rol:</label>
        <select
          className="w-full p-2 rounded text-black bg-white border border-gray-300"
          value={selectedRoleId}
          onChange={e => setSelectedRoleId(e.target.value)}
        >
          <option value="">Selecciona un rol</option>
          {roles.map(role => (
            <option key={role.role_id} value={role.role_id}>{role.role_name}</option>
          ))}
        </select>
      </div>
      <DialogFooter className='justify-between mt-4'>
        <Button type="submit" className="bg-[#017979] hover:bg-[#015e5e] text-black" onClick={handleAssignRole}>
          Asignar Rol
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </DialogFooter>
      {/* Confirmación para desasignar */}
      {confirmRemove && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg flex flex-col items-center">
            <p className="mb-4 text-black">
              ¿Estás seguro que deseas desasignar el rol <b>{confirmRemove.role_name}</b>?
            </p>
            <div className="flex gap-4">
              <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmRemoveRole}>
                Sí, desasignar
              </Button>
              <Button variant="secondary" onClick={() => setConfirmRemove(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </DialogContent>
  );
};