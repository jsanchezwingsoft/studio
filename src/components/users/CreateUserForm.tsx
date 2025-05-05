import React, { useState } from 'react';
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
import { fetchWrapper } from '@/utils/fetchWrapper';
import { useToast } from '@/hooks/use-toast';

/**
 * Props para CreateUserForm
 * @param onSuccessCallback Callback al crear usuario exitosamente
 * @param onCancel Callback para cancelar
 * @param defaultValues Valores por defecto para el formulario
 * @param canCreateUsers Permiso para crear usuarios
 */
export interface CreateUserFormProps {
  onSuccessCallback?: () => void;
  onCancel?: () => void;
  defaultValues?: {
    username?: string;
    email?: string;
    password?: string;
    phone?: string;
  };
  canCreateUsers: boolean;
}

/**
 * Componente modular y reutilizable para crear usuarios.
 * - Maneja su propio estado y validaciones.
 * - Realiza la llamada a la API para crear usuario.
 * - Muestra notificaciones y feedback.
 * - Puede ser usado en modales, páginas, etc.
 */
export const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onSuccessCallback,
  onCancel,
  defaultValues,
  canCreateUsers,
}) => {
  const [newUsername, setNewUsername] = useState(defaultValues?.username || '');
  const [newEmail, setNewEmail] = useState(defaultValues?.email || '');
  const [newPassword, setNewPassword] = useState(defaultValues?.password || '');
  const [newPhone, setNewPhone] = useState(defaultValues?.phone || '');
  const { toast } = useToast();

  const handleCreateUser = async () => {
    if (!canCreateUsers) {
      toast({
        variant: "destructive",
        title: "Sin permisos",
        description: "No tienes permisos para crear usuarios.",
      });
      return;
    }
    // Validaciones básicas
    if (!newUsername || !newEmail || !newPassword) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Usuario, email y contraseña son obligatorios.",
      });
      return;
    }
    try {
      const user = {
        username: newUsername,
        email: newEmail,
        password: newPassword,
        phone: newPhone,
      };
      const response = await fetchWrapper(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/v1/users/`,
        {
          method: 'POST',
          body: user,
        }
      );
      if (response.status >= 200 && response.status < 300) {
        const data = await response.json();
        toast({
          variant: "success",
          title: "Usuario creado con éxito",
          description: (
            <Alert className='flex gap-2'>
              <div className='flex flex-col'>
                <AlertTitle>Usuario</AlertTitle>
                <AlertDescription>{data.username}</AlertDescription>
              </div>
              <div className='flex flex-col'>
                <AlertTitle>Email</AlertTitle>
                <AlertDescription>{data.email}</AlertDescription>
              </div>
            </Alert>
          ),
        });
        setNewUsername('');
        setNewEmail('');
        setNewPassword('');
        setNewPhone('');
        if (onSuccessCallback) onSuccessCallback();
      } else {
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Error al crear el usuario",
          description: errorData.message || "Error inesperado.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al crear el usuario",
        description: "Error inesperado.",
      });
      console.error("Error inesperado:", error);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Crear nuevo usuario</DialogTitle>
        <DialogDescription>
          Introduce los datos del nuevo usuario:
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Input
            id="name"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="col-span-4"
            type="text"
            placeholder="Username"
            autoFocus
          />
          <Input
            id="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="col-span-4"
            type="email"
            placeholder="Email"
          />
          <Input
            id="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="col-span-4"
            type="password"
            placeholder="Password"
          />
          <Input
            id="phone"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            className="col-span-4"
            type="text"
            placeholder="Phone"
          />
        </div>
      </div>
      <DialogFooter className='justify-between'>
        <Button type="submit" onClick={handleCreateUser}>
          Crear
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};