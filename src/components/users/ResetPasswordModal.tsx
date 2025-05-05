import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ResetPasswordModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  username: string;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  open,
  onClose,
  userId,
  username,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async () => {
    if (!newPassword) {
      toast({
        variant: 'destructive',
        title: 'Campo requerido',
        description: 'Debes ingresar una nueva contraseña.',
      });
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/v1/users/reset-password/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Error al resetear la contraseña');
      }
      toast({
        variant: 'success',
        title: 'Contraseña reseteada',
        description: data.message || 'La contraseña fue reseteada exitosamente.',
      });
      setNewPassword('');
      onClose();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo resetear la contraseña.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resetear contraseña</DialogTitle>
        </DialogHeader>
        <div className="mb-4">
          <p>
            Usuario: <span className="font-semibold">{username}</span>
          </p>
        </div>
        <div className="mb-4">
          <Input
            type="password"
            placeholder="Nueva contraseña"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            disabled={loading}
          />
        </div>
        <DialogFooter>
          <Button onClick={handleResetPassword} disabled={loading}>
            {loading ? 'Reseteando...' : 'Resetear'}
          </Button>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};