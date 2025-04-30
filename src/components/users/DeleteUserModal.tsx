import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DeleteUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    user_id: string;
    username: string;
    email: string;
  };
  onDeleted?: () => void;
}

export const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  open,
  onClose,
  user,
  onDeleted,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/users/delete/${user.user_id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );
      if (response.status === 204) {
        toast({
          variant: 'success',
          title: 'Usuario eliminado',
          description: `El usuario "${user.username}" fue eliminado correctamente.`,
        });
        onDeleted && onDeleted();
        onClose();
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.detail || data.message || 'Error al eliminar el usuario');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo eliminar el usuario.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Eliminar usuario</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p>
            ¿Estás seguro que deseas eliminar al usuario <span className="font-semibold">{user.username}</span> ({user.email})?
          </p>
        </div>
        <DialogFooter>
          <Button onClick={handleDelete} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
            {loading ? 'Eliminando...' : 'Eliminar'}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};