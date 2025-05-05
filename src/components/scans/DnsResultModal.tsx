'use client';
import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Globe, Loader2, BadgeCheck, AlertTriangle, Mail } from 'lucide-react';

interface DnsResultModalProps {
  urlId: string | null;
  open: boolean;
  onClose: () => void;
}

const badge = (text: string, color: string) => (
  <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${color}`}>{text}</span>
);

const isKnownProvider = (provider: string) => {
  if (!provider) return false;
  const known = ['cloudflare.com', 'google.com', 'awsdns', 'azure', 'dreamhost.com', 'godaddy.com', 'digitalocean.com'];
  return known.some(k => provider.toLowerCase().includes(k));
};

const isNearExpiration = (exp: string) => {
  if (!exp) return false;
  const expDate = new Date(exp);
  const now = new Date();
  const diff = (expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diff < 30 && diff > 0;
};

export const DnsResultModal: React.FC<DnsResultModalProps> = ({ urlId, open, onClose }) => {
  const [dnsResult, setDnsResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && urlId) {
      setLoading(true);
      setError(null);
      setDnsResult(null);
      const accessToken = sessionStorage.getItem('accessToken');
      fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL}/v1/urlscan/dns-result/${urlId}`, {
        method: 'GET', 
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.detail || data.message || 'Error al obtener el resultado DNS');
          }
          setDnsResult(data);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [open, urlId]);

  const renderList = (items: any[], badgeIfEmpty?: boolean) =>
    items && items.length > 0 ? (
      <ul className="list-disc pl-5 text-sm space-y-1 break-all">
        {items.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    ) : badgeIfEmpty ? (
      badge('Sin registros', 'bg-red-200 text-red-800')
    ) : (
      <span className="text-muted-foreground">-</span>
    );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-[#017979]" />
              Detalle del análisis DNS y WHOIS
            </span>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-6 text-center flex flex-col items-center gap-2">
            <Loader2 className="animate-spin w-8 h-8 text-[#017979]" />
            <span>Cargando análisis DNS...</span>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-red-600">{error}</div>
        ) : dnsResult ? (
          <div className="py-2 space-y-4 text-sm bg-card rounded max-h-[400px] overflow-y-auto pr-2">
            {/* 1. Análisis de registros DNS */}
            <div className="border-b pb-2">
              <h3 className="font-semibold mb-1">1. Análisis de registros DNS</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div>
                  <span className="font-semibold">Registros A:</span>
                  {renderList(dnsResult["1. Análisis de registros DNS"]?.["Registros A"] || [], true)}
                </div>
                <div>
                  <span className="font-semibold">Registros AAAA:</span>
                  {renderList(dnsResult["1. Análisis de registros DNS"]?.["Registros AAAA"] || [], true)}
                </div>
                <div>
                  <span className="font-semibold">Registros CNAME:</span>
                  {renderList(dnsResult["1. Análisis de registros DNS"]?.["Registros CNAME"] || [], true)}
                </div>
                <div>
                  <span className="font-semibold">Registros MX:</span>
                  {renderList(dnsResult["1. Análisis de registros DNS"]?.["Registros MX"] || [], true)}
                </div>
                <div>
                  <span className="font-semibold">Registros NS:</span>
                  {renderList(dnsResult["1. Análisis de registros DNS"]?.["Registros NS"] || [], true)}
                </div>
                <div>
                  <span className="font-semibold">Registros TXT:</span>
                  {renderList(dnsResult["1. Análisis de registros DNS"]?.["Registros TXT"] || [], true)}
                </div>
              </div>
            </div>
            {/* 2. Proveedor DNS */}
            <div className="border-b pb-2 flex items-center gap-2">
              <span className="font-semibold">2. Proveedor DNS:</span>
              <span>
                {dnsResult["2. Proveedor DNS"]
                  ? isKnownProvider(dnsResult["2. Proveedor DNS"])
                    ? badge(dnsResult["2. Proveedor DNS"], 'bg-green-200 text-green-800')
                    : badge(dnsResult["2. Proveedor DNS"], 'bg-gray-200 text-gray-800')
                  : '-'}
              </span>
            </div>
            {/* 3. DNSSEC */}
            <div className="border-b pb-2">
              <span className="font-semibold">3. DNSSEC:</span>
              <div className="ml-4 flex flex-col gap-1">
                <span>
                  <span className="font-semibold">Habilitado:</span>{" "}
                  {dnsResult["3. DNSSEC"]?.["Habilitado"] ? (
                    badge('Sí', 'bg-green-200 text-green-800')
                  ) : (
                    badge('No', 'bg-red-200 text-red-800')
                  )}
                </span>
                <span>
                  <span className="font-semibold">Detalles:</span>{" "}
                  {dnsResult["3. DNSSEC"]?.["Detalles"] || '-'}
                </span>
              </div>
            </div>
            {/* 4. Información WHOIS */}
            <div>
              <span className="font-semibold">4. Información WHOIS:</span>
              <div className="ml-4 flex flex-col gap-1">
                <span>
                  <span className="font-semibold">Nombre de dominio:</span>{" "}
                  {dnsResult["4. Información WHOIS"]?.["Nombre de dominio"] || '-'}
                </span>
                <span>
                  <span className="font-semibold">Registrador:</span>{" "}
                  {dnsResult["4. Información WHOIS"]?.["Registrador"] || '-'}
                </span>
                <span>
                  <span className="font-semibold">Fechas:</span>
                  <div className="ml-4">
                    <span>
                      <span className="font-semibold">Fecha de creación:</span>{" "}
                      {dnsResult["4. Información WHOIS"]?.["Fechas"]?.["Fecha de creación"] || '-'}
                    </span>
                    <br />
                    <span>
                      <span className="font-semibold">Fecha de expiración:</span>{" "}
                      {dnsResult["4. Información WHOIS"]?.["Fechas"]?.["Fecha de expiración"] || '-'}
                      {/* Badge de expiración */}
                      {isNearExpiration(dnsResult["4. Información WHOIS"]?.["Fechas"]?.["Fecha de expiración"])
                        ? badge('Próxima a expirar', 'bg-yellow-200 text-yellow-800 ml-2')
                        : null}
                    </span>
                  </div>
                </span>
                <span>
                  <span className="font-semibold">Servidores de nombres:</span>
                  {renderList(dnsResult["4. Información WHOIS"]?.["Servidores de nombres"] || [])}
                </span>
                <span>
                  <span className="font-semibold">Correos electrónicos:</span>
                  {dnsResult["4. Información WHOIS"]?.["Correos electrónicos"]?.length > 0
                    ? (
                      <>
                        {badge('Presentes', 'bg-green-200 text-green-800 mr-2')}
                        {renderList(dnsResult["4. Información WHOIS"]?.["Correos electrónicos"] || [])}
                      </>
                    )
                    : badge('No encontrados', 'bg-gray-200 text-gray-800')}
                </span>
                <span>
                  <span className="font-semibold">Organización:</span>{" "}
                  {dnsResult["4. Información WHOIS"]?.["Organización"] || '-'}
                </span>
                <span>
                  <span className="font-semibold">País:</span>{" "}
                  {dnsResult["4. Información WHOIS"]?.["País"] || '-'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">No hay datos para mostrar.</div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Cerrar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};