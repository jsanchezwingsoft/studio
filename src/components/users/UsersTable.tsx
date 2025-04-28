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

interface User {
  user_id: string;
  username: string;
  email: string;
  is_active: boolean;
  roles: string[];
}

interface UsersTableProps {
  onEditUser?: (user: User) => void;
  onDeleteUser?: (user: User) => void;
}

const API_URL = 'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/users/list-with-roles';

export const UsersTable: React.FC<UsersTableProps> = ({
  onEditUser,
  onDeleteUser,
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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
                    {user.is_active
                      ? <span className="text-green-600 font-semibold">Sí</span>
                      : <span className="text-red-600 font-semibold">No</span>
                    }
                  </TableCell>
                  <TableCell>
                    {user.roles && user.roles.length > 0
                      ? user.roles.join(', ')
                      : <span className="text-gray-400">Sin rol</span>
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {onEditUser && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onEditUser(user)}
                        >
                          Editar
                        </Button>
                      )}
                      {onDeleteUser && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => onDeleteUser(user)}
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
};