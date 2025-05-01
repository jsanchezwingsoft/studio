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
import { ShieldAlert, Loader2, Server } from 'lucide-react';

interface VulnResultModalProps {
  urlId: string | null;
  open: boolean;
  onClose: () => void;
}

const badge = (text: string, color: string, tooltip?: string) => (
  <span
    className={`inline-block px-2 py-1 rounded text-xs font-semibold ${color} cursor-help`}
    title={tooltip || text}
  >
    {text}
  </span>
);

const severityBadge = (sev: string) => {
  if (!sev) return null;
  let color = "bg-gray-200 text-gray-800";
  let tooltip = "Severidad desconocida";
  if (sev === "CRITICAL") { color = "bg-red-800 text-white"; tooltip = "Crítica"; }
  else if (sev === "HIGH") { color = "bg-red-200 text-red-800"; tooltip = "Alta"; }
  else if (sev === "MEDIUM") { color = "bg-yellow-200 text-yellow-800"; tooltip = "Media"; }
  else if (sev === "LOW") { color = "bg-blue-200 text-blue-800"; tooltip = "Baja"; }
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ml-2 ${color}`} title={`Severidad: ${tooltip}`}>
      {sev}
    </span>
  );
};

const globalGradeBadge = (grade: string) => {
  if (!grade) return null;
  let color = "bg-gray-200 text-gray-800";
  let tooltip = "Calificación global de seguridad";
  if (grade === "A+" || grade === "A") { color = "bg-green-200 text-green-800"; tooltip = "Excelente"; }
  else if (grade === "B+" || grade === "B") { color = "bg-yellow-200 text-yellow-800"; tooltip = "Aceptable"; }
  else { color = "bg-red-200 text-red-800"; tooltip = "Riesgo alto"; }
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ml-2 ${color}`} title={tooltip}>
      {grade}
    </span>
  );
};

export const VulnResultModal: React.FC<VulnResultModalProps> = ({ urlId, open, onClose }) => {
  const [vulnResult, setVulnResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && urlId) {
      setLoading(true);
      setError(null);
      setVulnResult(null);
      const accessToken = sessionStorage.getItem('accessToken');
      fetch(`https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/urlscan/vuln-result/${urlId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.detail || data.message || 'Error al obtener el resultado de vulnerabilidades');
          }
          setVulnResult(data);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [open, urlId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-[#017979]" />
              Detalle de vulnerabilidades detectadas
              {vulnResult?.["Clasificación Global"] && globalGradeBadge(vulnResult["Clasificación Global"])}
            </span>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-6 text-center flex flex-col items-center gap-2">
            <Loader2 className="animate-spin w-8 h-8 text-[#017979]" />
            <span>Cargando análisis de vulnerabilidades...</span>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-red-600">{error}</div>
        ) : vulnResult ? (
          <div className="py-2 space-y-4 text-sm bg-card rounded max-h-[500px] overflow-y-auto pr-2">
            {/* Puertos abiertos */}
            <div className="border-b pb-2">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Server className="w-4 h-4 text-[#017979]" /> Puertos abiertos detectados
              </h3>
              <table className="min-w-full border text-xs mb-2">
                <thead>
                  <tr>
                    <th className="p-1 border">Puerto</th>
                    <th className="p-1 border">Servicio</th>
                    <th className="p-1 border">Producto</th>
                    <th className="p-1 border">Versión</th>
                    <th className="p-1 border">CPE</th>
                  </tr>
                </thead>
                <tbody>
                  {(vulnResult["puertos_abiertos"] || []).map((p: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-1 border">{p.port}</td>
                      <td className="p-1 border">{p.service}</td>
                      <td className="p-1 border">{p.product}</td>
                      <td className="p-1 border">{p.version}</td>
                      <td className="p-1 border">{p.cpe}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Vulnerabilidades agrupadas por puerto/servicio */}
            <div>
              <h3 className="font-semibold mb-1">Vulnerabilidades detectadas por servicio/puerto</h3>
              {(vulnResult["vulnerabilidades"] || []).map((grupo: any, idx: number) => (
                <div key={idx} className="mb-4 border-b pb-2">
                  <div className="font-semibold text-[#017979] mb-1">
                    {grupo.puerto_servicio}
                  </div>
                  {grupo.cves.length === 0 ? (
                    <span className="text-muted-foreground">No se encontraron CVEs relevantes para este servicio.</span>
                  ) : (
                    <ul className="space-y-2">
                      {grupo.cves.map((cve: any, cidx: number) => (
                        <li key={cve.cve_id || cidx} className="bg-muted rounded p-2">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <a
                              href={cve.enlace_cve}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-blue-700 hover:underline"
                            >
                              {cve.cve_id}
                            </a>
                            {severityBadge(cve.severidad)}
                            {cve.cwe && cve.cwe.length > 0 && (
                              <span className="ml-2 text-xs text-gray-500">CWE: {cve.cwe.join(", ")}</span>
                            )}
                          </div>
                          <div className="mb-1">{cve.descripcion}</div>
                          {cve.referencias && cve.referencias.length > 0 && (
                            <div className="text-xs">
                              <span className="font-semibold">Referencias:</span>{" "}
                              {cve.referencias.map((ref: string, ridx: number) => (
                                <a
                                  key={ridx}
                                  href={ref}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline mr-2"
                                >
                                  [{ridx + 1}]
                                </a>
                              ))}
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
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