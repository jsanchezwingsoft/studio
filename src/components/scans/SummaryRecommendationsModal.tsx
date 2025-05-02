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
import { FileText, Loader2, Info, Star, Award } from 'lucide-react';

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
    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ml-2 ${color}`} title={tooltip}>
      <Star className="inline w-3 h-3 mr-1" />{score}
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
    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ml-2 ${color}`} title={tooltip}>
      <Award className="inline w-3 h-3 mr-1" />{clasificacion}
    </span>
  );
};

export const SummaryRecommendationsModal: React.FC<SummaryRecommendationsModalProps> = ({ urlId, open, onClose }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && urlId) {
      setLoading(true);
      setError(null);
      setSummary(null);
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-[#017979]" />
              Resumen y recomendaciones
              {typeof summary?.puntuacion === "number" && scoreBadge(summary.puntuacion)}
              {summary?.clasificacion && classificationBadge(summary.clasificacion)}
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
          <div className="py-2 space-y-4 text-sm bg-card rounded max-h-[400px] overflow-y-auto pr-2">
            <div className="mb-2">
              <span className="font-semibold flex items-center gap-1">
                Resumen
                <Info className="w-4 h-4 text-muted-foreground" title="Resumen general del estado de seguridad de la URL." />
              </span>
              <div className="ml-2">{summary.resumen || '-'}</div>
            </div>
            <div className="mb-2">
              <span className="font-semibold flex items-center gap-1">
                Recomendaciones detalladas
                <Info className="w-4 h-4 text-muted-foreground" title="Acciones sugeridas para mejorar la seguridad y reducir riesgos." />
              </span>
              {summary.recomendaciones_detalladas && summary.recomendaciones_detalladas.length > 0 ? (
                <ul className="list-disc pl-5 text-sm space-y-1 break-all">
                  {summary.recomendaciones_detalladas.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <span className="ml-2 text-muted-foreground">-</span>
              )}
            </div>
            <div className="mb-2 flex items-center gap-2">
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