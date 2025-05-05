import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UserDetailModalProps {
  open: boolean;
  onClose: () => void;
  userId: string | null;
}

interface UserDetail {
  user_id: string;
  username: string;
  email: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  open,
  onClose,
  userId,
}) => {
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      setError(null);
      setUser(null);
      const token = sessionStorage.getItem('accessToken');

      fetch(`${baseUrl}/v1/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.detail || data.message || 'Error al obtener detalles del usuario');
          }
          return res.json();
        })
        .then(setUser)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [open, userId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Detalle de usuario</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="mb-4">Cargando...</div>
        ) : error ? (
          <div className="mb-4 text-red-600">{error}</div>
        ) : user ? (
          <div className="mb-4 space-y-2">
            <div><b>ID:</b> {user.user_id}</div>
            <div><b>Nombre:</b> {user.username}</div>
            <div><b>Email:</b> {user.email}</div>
            <div><b>Teléfono:</b> {user.phone || 'Sin teléfono'}</div>
            <div><b>Activo:</b> {user.is_active ? 'Sí' : 'No'}</div>
            <div><b>Creado:</b> {user.created_at}</div>
            <div><b>Actualizado:</b> {user.updated_at}</div>
          </div>
        ) : (
          <div className="mb-4">No hay datos.</div>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};