import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface EditUserModalProps {
  open: boolean;
  onClose: () => void;
  user: {
    user_id: string;
    username: string;
    email: string;
    phone?: string;
    is_active: boolean;
  };
  onUpdated?: (updatedUser: any) => void;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  open,
  onClose,
  user,
  onUpdated,
}) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [isActive, setIsActive] = useState(user.is_active);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!username && !email && !phone && isActive === user.is_active) {
      toast({
        variant: 'destructive',
        title: 'Nada para actualizar',
        description: 'Debes modificar al menos un campo.',
      });
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const body: any = {};
      if (username !== user.username) body.username = username;
      if (email !== user.email) body.email = email;
      if (phone !== (user.phone || '')) body.phone = phone;
      if (isActive !== user.is_active) body.is_active = isActive;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/v1/users/update/${user.user_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(body),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Error al actualizar el usuario');
      }
      toast({
        variant: 'success',
        title: 'Usuario actualizado',
        description: 'Los datos del usuario fueron actualizados correctamente.',
      });
      onUpdated && onUpdated(data);
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo actualizar el usuario.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuario</DialogTitle>
        </DialogHeader>
        <div className="mb-4 space-y-2">
          <Input
            type="text"
            placeholder="Nombre de usuario"
            value={username}
            onChange={e => setUsername(e.target.value)}
            disabled={loading}
          />
          <Input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={loading}
          />
          <Input
            type="text"
            placeholder="Teléfono"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            disabled={loading}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="is_active" className="text-sm">Activo</label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleUpdate} disabled={loading}>
            {loading ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};