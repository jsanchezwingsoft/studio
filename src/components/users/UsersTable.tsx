import React, { useEffect, useState } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, KeyRound, Pencil, Trash2 } from 'lucide-react';
import { ResetPasswordModal } from './ResetPasswordModal';
import { EditUserModal } from './EditUserModal';
import { DeleteUserModal } from './DeleteUserModal';

interface User {
  user_id: string;
  username: string;
  email: string;
  phone?: string;
  is_active: boolean;
  roles: string[];
}
interface UsersTableProps {
  onViewUser?: (user: User) => void;
}
const API_URL = 'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/users/list-with-roles';

export const UsersTable: React.FC<UsersTableProps> = ({
  onViewUser,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Estado para los modales
  const [resetUser, setResetUser] = useState<{ user_id: string; username: string } | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const fetchUsers = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!response.ok) throw new Error('Error al obtener los usuarios');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error al obtener los usuarios:', error);
    } finally {
      if (isInitial) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers(true);
    const intervalId = setInterval(() => fetchUsers(false), 5000);
    return () => clearInterval(intervalId);
  }, []);

  // Actualiza la tabla tras editar/eliminar usuario
  const handleUserUpdatedOrDeleted = () => {
    fetchUsers(false);
  };

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-4">Usuarios</h2>
      {loading ? (
        <Skeleton className="w-full h-60" />
      ) : (
        <>
          {refreshing && (
            <div className="absolute right-2 top-2 text-xs text-[#017979] animate-pulse z-10">
              Actualizando...
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Opciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.user_id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.user_id}</TableCell>
                  <TableCell>
                    {user.is_active ? (
                      <span className="heartbeat-green">Sí</span>
                    ) : (
                      <span className="heartbeat-red">No</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.roles && user.roles.length > 0
                      ? user.roles.join(', ')
                      : <span className="text-gray-400">Sin rol</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Ver usuario"
                        onClick={() => onViewUser && onViewUser(user)}
                      >
                        <Eye className="w-5 h-5 text-blue-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Cambiar contraseña"
                        onClick={() => setResetUser({ user_id: user.user_id, username: user.username })}
                      >
                        <KeyRound className="w-5 h-5 text-yellow-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Actualizar usuario"
                        onClick={() => setEditUser(user)}
                      >
                        <Pencil className="w-5 h-5 text-green-600" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Eliminar usuario"
                        onClick={() => setDeleteUser(user)}
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {/* Modal de reset password */}
          {resetUser && (
            <ResetPasswordModal
              open={!!resetUser}
              onClose={() => setResetUser(null)}
              userId={resetUser.user_id}
              username={resetUser.username}
            />
          )}
          {/* Modal de editar usuario */}
          {editUser && (
            <EditUserModal
              open={!!editUser}
              onClose={() => setEditUser(null)}
              user={editUser}
              onUpdated={handleUserUpdatedOrDeleted}
            />
          )}
          {/* Modal de eliminar usuario */}
          {deleteUser && (
            <DeleteUserModal
              open={!!deleteUser}
              onClose={() => setDeleteUser(null)}
              user={deleteUser}
              onDeleted={handleUserUpdatedOrDeleted}
            />
          )}
        </>
      )}
    </div>
  );
};