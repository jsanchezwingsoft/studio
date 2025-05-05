'use client';
import React, { useState, useEffect } from 'react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { fetchWrapper } from '@/utils/fetchWrapper';
import { useToast } from '@/hooks/use-toast';

interface EnterUrlsScanProps {
  onClose: () => void;
  onScanSuccess?: () => void;
}

const EnterUrlsScan: React.FC<EnterUrlsScanProps> = ({ onClose, onScanSuccess }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Limpiar el estado cada vez que se abre el modal
  useEffect(() => {
    setUrl('');
    setError(null);
    setIsLoading(false);
  }, []);

  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    const urlToScan = url;
    setUrl('');
    try {
      const response = await fetchWrapper(
        `${process.env.NEXT_PUBLIC_BASE_API_URL}/v1/urlscan/detect-protocol` || ``,
        {
          method: 'POST',
          
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: urlToScan }),
        }
      );
      let data;
      if (response && typeof response.json === 'function') {
        data = await response.json();
      } else if (response && typeof response === 'object' && 'error' in response) {
        throw new Error(response.error);
      } else {
        data = response;
      }
      toast({
        variant: 'success',
        title: 'Escaneo exitoso',
        description: 'La URL fue escaneada correctamente.',
      });
      if (onScanSuccess) onScanSuccess();
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error al escanear la URL');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'No se pudo escanear la URL.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Escanear URL</DialogTitle>
      </DialogHeader>
      <Input
        type="text"
        placeholder="Ingresa la URL"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
      />
      <div className="mt-4 min-h-[40px] flex items-center">
        {isLoading && (
          <span className="flex items-center gap-2 text-[#017979]">
            <span className="relative flex h-8 w-8">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#017979] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-8 w-8 border-4 border-[#017979] border-t-transparent animate-spin"></span>
            </span>
            <span className="ml-2">Escaneando...</span>
          </span>
        )}
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <DialogFooter>
        <Button type="button" onClick={handleScan} disabled={isLoading || !url}>
          Escanear
        </Button>
        <DialogClose asChild>
          <Button type="button" variant="secondary" disabled={isLoading}>
            Cerrar
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default EnterUrlsScan;