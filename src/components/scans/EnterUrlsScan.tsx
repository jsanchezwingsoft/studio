'use client';
import React, { useState } from 'react';
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

interface EnterUrlsScanProps {
  onClose: () => void;
}

const EnterUrlsScan: React.FC<EnterUrlsScanProps> = ({ onClose }) => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    const urlToScan = url;
    setUrl('');
    try {
      const response = await fetchWrapper(
        'https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/urlscan/detect-protocol',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: urlToScan }),
        }
      );
      // Si fetchWrapper devuelve un objeto Response, parsea el JSON
      if (typeof response.json === 'function') {
        const data = await response.json();
        setResult(data);
      } else if (response.error) {
        throw new Error(response.error);
      } else {
        setResult(response);
      }
    } catch (err: any) {
      setError(err.message || 'Error al escanear la URL');
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
      <div className="mt-4">
        {isLoading && <p>Cargando...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {result && (
          <div className="bg-gray-100 p-4 rounded text-xs overflow-x-auto">
            <h2 className="font-semibold text-lg mb-2">Resultado del escaneo</h2>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
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