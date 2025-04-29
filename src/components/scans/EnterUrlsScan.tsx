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
  onScanSuccess?: () => void; // Nuevo prop para notificar éxito
}

const EnterUrlsScan: React.FC<EnterUrlsScanProps> = ({ onClose, onScanSuccess }) => {
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
      if (response.error) {
        throw new Error(response.error);
      }
      if (typeof response.json === 'function') {
        const data = await response.json();
        setResult(data);
        if (onScanSuccess) onScanSuccess(); // Notifica al padre para refrescar la tabla
      } else {
        setResult(response);
        if (onScanSuccess) onScanSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Error al escanear la URL');
    } finally {
      setIsLoading(false);
    }
  };

  // Extrae el análisis SSL/TLS si existe
  const ssl = result?.ssl_info?.["1. Análisis del certificado SSL/TLS"];

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
        {result && ssl && (
          <div className="bg-card p-4 rounded text-xs overflow-x-auto space-y-2">
            <h2 className="font-semibold text-lg mb-2">Resultado del escaneo</h2>
            <div className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="font-semibold">Protocolo:</span>
              <span>{ssl.protocolo || '-'}</span>
              <span className="font-semibold ml-4">Cifrado:</span>
              <span>{ssl.cifrado || '-'}</span>
              <span className="font-semibold ml-4">Tamaño de clave:</span>
              <span>{ssl.tamano_clave || '-'}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="font-semibold">Algoritmo de clave:</span>
              <span>{ssl.algoritmo_clave || '-'}</span>
              <span className="font-semibold ml-4">Key Exchange Group:</span>
              <span>{ssl.key_exchange_group || '-'}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-semibold">Validez:</span>
              <div className="ml-4 flex flex-wrap gap-4">
                <span>
                  <span className="font-semibold">Desde:</span> {ssl.validez_desde ? new Date(ssl.validez_desde).toLocaleString() : '-'}
                </span>
                <span>
                  <span className="font-semibold">Hasta:</span> {ssl.validez_hasta ? new Date(ssl.validez_hasta).toLocaleString() : '-'}
                </span>
                <span>
                  <span className="font-semibold">Estado:</span>
                  <span className={`ml-2 px-2 py-1 rounded bg-green-200 text-green-800`}>
                    {ssl.validez_estado || '-'}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="font-semibold">Revocación:</span>
              <span>{ssl.revocacion || '-'}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="font-semibold">Emisor:</span>
              <span>{ssl.emisor || '-'}</span>
              <span className="font-semibold ml-4">Autofirmado:</span>
              <span>{ssl.autofirmado ? 'Sí' : 'No'}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="font-semibold">Clasificación:</span>
              <span className={`px-2 py-1 rounded bg-yellow-200 text-yellow-800`}>
                {ssl.clasificacion || '-'}
              </span>
              <span className="font-semibold ml-4">Calificación de seguridad:</span>
              <span>{ssl.calificacion_seguridad || '-'}</span>
            </div>
            <div>
              <span className="font-semibold">Recomendaciones:</span>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {(ssl.recomendaciones || '').split('\n').filter(Boolean).map((rec: string, idx: number) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {result && !ssl && (
          <div className="bg-card p-4 rounded text-xs overflow-x-auto">
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