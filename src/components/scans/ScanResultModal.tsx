'use client';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BadgeCheck, AlertCircle, Info, ShieldCheck } from 'lucide-react';

interface ScanResultModalProps {
  urlId: string | null;
  open: boolean;
  onClose: () => void;
}

const badgeColor = (estado: string) => {
  if (!estado) return 'bg-gray-300 text-gray-800';
  if (estado.includes('Vigente')) return 'bg-green-200 text-green-800';
  if (estado.includes('Expirado')) return 'bg-red-200 text-red-800';
  if (estado.includes('Error')) return 'bg-red-200 text-red-800';
  if (estado.includes('Aún no válido')) return 'bg-blue-200 text-blue-800';
  return 'bg-gray-300 text-gray-800';
};

const classificationBadge = (clasificacion: string) => {
  if (!clasificacion) return 'bg-gray-300 text-gray-800';
  if (clasificacion === 'A+' || clasificacion === 'A') return 'bg-green-200 text-green-800';
  if (clasificacion === 'B') return 'bg-yellow-200 text-yellow-800';
  if (clasificacion === 'C') return 'bg-red-200 text-red-800';
  return 'bg-gray-300 text-gray-800';
};

const boolToText = (val: any) => val === true ? 'Sí' : val === false ? 'No' : '';

const renderRecomendaciones = (recs: string) => {
  if (!recs) return null;
  const items = recs.split('\n').filter(Boolean);
  return (
    <ul className="list-disc pl-5 text-sm space-y-1">
      {items.map((rec, idx) => (
        <li key={idx} className="flex items-center gap-1">
          <Info className="w-4 h-4 text-blue-500" /> {rec}
        </li>
      ))}
    </ul>
  );
};

export const ScanResultModal: React.FC<ScanResultModalProps> = ({ urlId, open, onClose }) => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && urlId) {
      setLoading(true);
      setError(null);
      setScanResult(null);
      const accessToken = sessionStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL;
      fetch(`${baseUrl}/v1/urlscan/ssl-result/${urlId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.detail || data.message || 'Error al obtener el resultado del escaneo');
          }
          setScanResult(data);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [open, urlId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#017979]" />
              Detalle del último escaneo SSL/TLS
            </span>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-6 text-center">Cargando...</div>
        ) : error ? (
          <div className="py-6 text-center text-red-600">{error}</div>
        ) : scanResult ? (
          <div className="py-2 space-y-3">
            <div className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="font-semibold">Protocolo:</span>
              <span>{scanResult.protocolo || '-'}</span>
              <span className="font-semibold ml-4">Cifrado:</span>
              <span>{scanResult.cifrado || '-'}</span>
              <span className="font-semibold ml-4">Tamaño de clave:</span>
              <span>{scanResult.tamano_clave || '-'}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="font-semibold">Algoritmo de clave:</span>
              <span>{scanResult.algoritmo_clave || '-'}</span>
              <span className="font-semibold ml-4">Key Exchange Group:</span>
              <span>{scanResult.key_exchange_group || '-'}</span>
            </div>
            <div className="border-b pb-2">
              <span className="font-semibold">Validez:</span>
              <div className="ml-4 flex flex-wrap gap-4">
                <span>
                  <span className="font-semibold">Desde:</span> {scanResult.validez_desde ? new Date(scanResult.validez_desde).toLocaleString() : '-'}
                </span>
                <span>
                  <span className="font-semibold">Hasta:</span> {scanResult.validez_hasta ? new Date(scanResult.validez_hasta).toLocaleString() : '-'}
                </span>
                <span>
                  <span className="font-semibold">Estado:</span>
                  <span className={`ml-2 px-2 py-1 rounded ${badgeColor(scanResult.validez_estado)}`}>
                    {scanResult.validez_estado || '-'}
                  </span>
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="font-semibold">Revocación:</span>
              <span>{scanResult.revocacion || '-'}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="font-semibold">Emisor:</span>
              <span>{scanResult.emisor || '-'}</span>
              <span className="font-semibold ml-4">Autofirmado:</span>
              <span>{boolToText(scanResult.autofirmado)}</span>
            </div>
            <div className="flex flex-wrap gap-2 items-center border-b pb-2">
              <span className="font-semibold">Clasificación:</span>
              <span className={`px-2 py-1 rounded ${classificationBadge(scanResult.clasificacion)}`}>
                {scanResult.clasificacion || '-'}
              </span>
              <span className="font-semibold ml-4">Calificación de seguridad:</span>
              <span>{scanResult.calificacion_seguridad || '-'}</span>
            </div>
            <div>
              <span className="font-semibold">Recomendaciones:</span>
              {renderRecomendaciones(scanResult.recomendaciones)}
            </div>
            <div>
              <span className="font-semibold">Fecha del escaneo:</span> {scanResult.created_at ? new Date(scanResult.created_at).toLocaleString() : '-'}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">No hay datos para mostrar.</div>
        )}
        <DialogFooter>
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};