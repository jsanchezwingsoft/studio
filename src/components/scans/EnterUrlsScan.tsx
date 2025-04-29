'use client';
import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface EnterUrlsScanProps {
  onClose?: () => void; // Para cerrar el modal desde dentro
  onScanComplete?: (result: any) => void; // Nuevo: notifica al padre el resultado
}

export const EnterUrlsScan: React.FC<EnterUrlsScanProps> = ({ onClose, onScanComplete }) => {
  const [enterUrl, setEnterUrl] = useState('');
  const [loadingScan, setLoadingScan] = useState(false);
  const { toast } = useToast();

  const handleScanUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingScan(true);
    try {
      const accessToken = sessionStorage.getItem('accessToken');
      const response = await fetch('https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/urlscan/detect-protocol', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ url: enterUrl }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || data.message || 'Error al escanear la URL');
      }
      if (onScanComplete) onScanComplete(data); // Notifica al padre el resultado
      if (onClose) onClose(); // Cierra el modal
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo escanear la URL.',
      });
      if (onScanComplete) onScanComplete({ error: error.message || 'No se pudo escanear la URL.' });
      if (onClose) onClose();
    } finally {
      setLoadingScan(false);
    }
  };

  return (
    <div className="w-full max-w-xl bg-card p-6 rounded shadow">
      <form onSubmit={handleScanUrl} className="flex flex-col gap-4">
        <label className="font-semibold text-lg">Enter URLs (SSL/TLS Scan)</label>
        <input
          type="text"
          className="p-2 rounded border border-gray-300"
          placeholder="Ejemplo: wingsoft.com"
          value={enterUrl}
          onChange={e => setEnterUrl(e.target.value)}
          required
          disabled={loadingScan}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="btn-primary px-4 py-2 rounded"
            disabled={loadingScan}
          >
            {loadingScan ? 'Escaneando...' : 'Escanear'}
          </button>
          {onClose && (
            <button
              type="button"
              className="btn-secondary px-4 py-2 rounded"
              onClick={onClose}
              disabled={loadingScan}
            >
              Cerrar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};