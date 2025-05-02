'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Info, Star, Award, Download, User, Globe } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface SummaryRecommendationsModalProps {
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

const scoreBadge = (score: number) => {
  let color = "bg-gray-200 text-gray-800";
  let tooltip = "Puntuación de seguridad";
  if (score >= 90) { color = "bg-green-200 text-green-800"; tooltip = "Excelente"; }
  else if (score >= 70) { color = "bg-yellow-200 text-yellow-800"; tooltip = "Buena"; }
  else if (score >= 50) { color = "bg-orange-200 text-orange-800"; tooltip = "Aceptable"; }
  else { color = "bg-red-200 text-red-800"; tooltip = "Riesgo alto"; }
  return (
    <span className={`inline-block px-3 py-1 rounded text-base font-bold ml-2 ${color}`} title={tooltip}>
      <Star className="inline w-4 h-4 mr-1" />{score}
    </span>
  );
};

const classificationBadge = (clasificacion: string) => {
  if (!clasificacion) return null;
  let color = "bg-gray-200 text-gray-800";
  let tooltip = "Clasificación de seguridad";
  if (clasificacion === "A+" || clasificacion === "A") { color = "bg-green-200 text-green-800"; tooltip = "Excelente"; }
  else if (clasificacion === "B+" || clasificacion === "B") { color = "bg-yellow-200 text-yellow-800"; tooltip = "Aceptable"; }
  else { color = "bg-red-200 text-red-800"; tooltip = "Riesgo alto"; }
  return (
    <span className={`inline-block px-3 py-1 rounded text-base font-bold ml-2 ${color}`} title={tooltip}>
      <Award className="inline w-4 h-4 mr-1" />{clasificacion}
    </span>
  );
};

// Extrae la primera URL del resumen (si existe)
const extractUrlFromResumen = (resumen: string): string | null => {
  if (!resumen) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = resumen.match(urlRegex);
  return match && match.length > 0 ? match[0] : null;
};

export const SummaryRecommendationsModal: React.FC<SummaryRecommendationsModalProps> = ({ urlId, open, onClose }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && urlId) {
      setLoading(true);
      setError(null);
      setSummary(null);
      setUser(sessionStorage.getItem('username') || '');
      const accessToken = sessionStorage.getItem('accessToken');
      fetch(`https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/urlscan/summary-recommendations/${urlId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.detail || data.message || 'Error al obtener el resumen');
          }
          setSummary(data);
        })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [open, urlId]);

  const handleDownloadPDF = () => {
    if (typeof window !== 'undefined' && html2pdf && contentRef.current) {
      html2pdf()
        .set({
          margin: 0.5,
          filename: `resumen_${urlId}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        })
        .from(contentRef.current)
        .save();
    }
  };

  // Extrae la URL del resumen
  const resumenUrl = summary?.resumen ? extractUrlFromResumen(summary.resumen) : null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#017979]" />
              Resumen y recomendaciones
              <Info className="w-4 h-4 text-muted-foreground" title="Este resumen y recomendaciones se generan automáticamente a partir del análisis de seguridad." />
            </span>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-6 text-center flex flex-col items-center gap-2">
            <Loader2 className="animate-spin w-8 h-8 text-[#017979]" />
            <span>Cargando resumen...</span>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-red-600">{error}</div>
        ) : summary ? (
          <div ref={contentRef} className="py-2 space-y-6 text-base bg-card rounded max-h-[400px] overflow-y-auto pr-2">
            {/* Sección 1: Resumen ejecutivo */}
            <div className="mb-4 border-b pb-2">
              <div className="text-2xl font-bold mb-2 flex items-center gap-2">
                Resumen ejecutivo
                <Info className="w-4 h-4 text-muted-foreground" title="Resumen general del estado de seguridad de la URL." />
              </div>
              <div className="ml-2">{summary.resumen || '-'}</div>
            </div>
            {/* Sección 3: Recomendaciones detalladas */}
            <div className="mb-4 border-b pb-2">
              <span className="font-semibold flex items-center gap-1">
                Recomendaciones detalladas
                <Info className="w-4 h-4 text-muted-foreground" title="Acciones sugeridas para mejorar la seguridad y reducir riesgos." />
              </span>
              {summary.recomendaciones_detalladas && summary.recomendaciones_detalladas.length > 0 ? (
                <ul className="list-disc pl-5 text-base space-y-1 break-all">
                  {summary.recomendaciones_detalladas.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <span className="ml-2 text-muted-foreground">-</span>
              )}
            </div>
            {/* Sección 2: Puntuación y clasificación solo abajo a la izquierda */}
            <div className="mb-2 flex flex-col sm:flex-row justify-start items-start gap-4">
              <div className="flex items-center gap-2">
                <span className="font-semibold">Puntuación:</span>
                {typeof summary.puntuacion === "number" ? scoreBadge(summary.puntuacion) : "-"}
                <Info className="w-4 h-4 text-muted-foreground" title="Puntuación numérica de seguridad (0-100)." />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Clasificación:</span>
                {summary.clasificacion ? classificationBadge(summary.clasificacion) : "-"}
                <Info className="w-4 h-4 text-muted-foreground" title="Clasificación general de seguridad (A+, A, B+, B, etc.)." />
              </div>
            </div>
            {/* Sección 4: Metadatos */}
            <div className="mb-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-semibold">Usuario:</span>
                <span>{user || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="font-semibold">URL del sitio:</span>
                {resumenUrl ? (
                  <a href={resumenUrl} target="_blank" rel="noopener noreferrer" className="text-[#017979] font-semibold underline hover:text-[#015e5e]">
                    {resumenUrl}
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Fecha del análisis:</span>
                <span>{new Date().toLocaleString()}</span>
              </div>
            </div>
            {/* Footer */}
            <div className="mt-4 text-xs text-center text-muted-foreground border-t pt-2">
              <span>Generado por Mini-HackAnalyzer | HackAnalyzer</span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">No hay datos para mostrar.</div>
        )}
        <DialogFooter>
          <Button type="button" onClick={handleDownloadPDF} variant="primary">
            <Download className="w-4 h-4 mr-1" /> Descargar PDF
          </Button>
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