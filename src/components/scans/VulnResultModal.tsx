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
import { ShieldAlert, Loader2, ChevronDown, ChevronUp, Info } from 'lucide-react';

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
  if (sev === "CRITICAL") { color = "bg-red-800 text-white"; tooltip = "Vulnerabilidad crítica: requiere atención inmediata."; }
  else if (sev === "HIGH") { color = "bg-red-200 text-red-800"; tooltip = "Vulnerabilidad alta: riesgo importante."; }
  else if (sev === "MEDIUM") { color = "bg-yellow-200 text-yellow-800"; tooltip = "Vulnerabilidad media: riesgo moderado."; }
  else if (sev === "LOW") { color = "bg-blue-200 text-blue-800"; tooltip = "Vulnerabilidad baja: riesgo bajo."; }
  return (
    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ml-2 ${color}`} title={tooltip}>
      {sev}
    </span>
  );
};

const globalGradeBadge = (grade: string) => {
  if (!grade) return null;
  let color = "bg-gray-200 text-gray-800";
  let tooltip = "Calificación global de seguridad HTTP basada en puertos abiertos y CVEs detectados.";
  if (grade === "A+" || grade === "A") { color = "bg-green-200 text-green-800"; tooltip = "Excelente: sin vulnerabilidades críticas ni riesgos importantes."; }
  else if (grade === "B+" || grade === "B") { color = "bg-yellow-200 text-yellow-800"; tooltip = "Aceptable: algunos riesgos moderados o configuraciones mejorables."; }
  else { color = "bg-red-200 text-red-800"; tooltip = "Riesgo alto: vulnerabilidades críticas o muchos puertos abiertos."; }
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
  const [openCollapsible, setOpenCollapsible] = useState<string | null>(null);

  useEffect(() => {
    if (open && urlId) {
      setLoading(true);
      setError(null);
      setVulnResult(null);
      setOpenCollapsible(null);
      const accessToken = sessionStorage.getItem('accessToken');
      const baseUrl = process.env.NEXT_PUBLIC_BASE_API_URL || "https://coreapihackanalizerdeveloper.wingsoftlab.com";

      fetch(`${baseUrl}/v1/urlscan/vuln-result/${urlId}`, {
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
              <Info className="w-4 h-4 text-muted-foreground" title="La calificación global se calcula según la severidad de los CVEs y la cantidad de puertos abiertos." />
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
              <h3 className="font-semibold mb-1 flex items-center gap-1">
                Puertos abiertos detectados
                <Info className="w-4 h-4 text-muted-foreground" title="Solo se muestran los puertos realmente abiertos detectados por nmap." />
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
            {/* Vulnerabilidades agrupadas por puerto/servicio con collapsibles */}
            <div>
              <h3 className="font-semibold mb-1 flex items-center gap-1">
                Vulnerabilidades detectadas por servicio/puerto
                <Info className="w-4 h-4 text-muted-foreground" title="Se muestran los CVEs agrupados por cada puerto/servicio abierto." />
              </h3>
              {(vulnResult["vulnerabilidades"] || []).map((grupo: any, idx: number) => (
                <div key={idx} className="mb-4 border-b pb-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 font-semibold text-[#017979] w-full text-left focus:outline-none"
                    onClick={() => setOpenCollapsible(openCollapsible === grupo.puerto_servicio ? null : grupo.puerto_servicio)}
                  >
                    {openCollapsible === grupo.puerto_servicio ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    {grupo.puerto_servicio}
                    {grupo.cves.some((cve: any) => cve.severidad === "CRITICAL" || cve.severidad === "HIGH") && (
                      <span className="ml-2 px-2 py-1 rounded bg-red-200 text-red-800 text-xs" title="Servicio crítico">
                        Servicio crítico
                      </span>
                    )}
                  </button>
                  {openCollapsible === grupo.puerto_servicio && (
                    <div className="mt-2">
                      {grupo.cves.length === 0 ? (
                        <span className="text-muted-foreground">No se encontraron CVEs relevantes para este servicio.</span>
                      ) : (
                        <ul className="space-y-2">
                          {grupo.cves
                            .slice()
                            .sort((a: any, b: any) => {
                              const sevOrder = { "CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3, "": 4 };
                              return (sevOrder[a.severidad?.toUpperCase() || ""] ?? 4) - (sevOrder[b.severidad?.toUpperCase() || ""] ?? 4);
                            })
                            .map((cve: any, cidx: number) => (
                            <li key={cve.cve_id || cidx} className="bg-muted rounded p-2">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <a
                                  href={cve.enlace_cve}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-bold text-blue-700 hover:underline"
                                  title="Ver CVE en cve.org"
                                >
                                  {cve.cve_id}
                                </a>
                                {severityBadge(cve.severidad)}
                                {cve.cwe && cve.cwe.length > 0 && (
                                  <span className="ml-2 text-xs text-gray-500" title="Common Weakness Enumeration">
                                    CWE: {cve.cwe.join(", ")}
                                  </span>
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
                                      title="Ver referencia externa"
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