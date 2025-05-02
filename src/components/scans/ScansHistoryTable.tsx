'use client';
import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, ShieldCheck, Globe, Lock, ShieldAlert, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScanResultModal } from './ScanResultModal';
import { DnsResultModal } from './DnsResultModal';
import { HttpResultModal } from './HttpResultModal';
import { VulnResultModal } from './VulnResultModal';
import { SummaryRecommendationsModal } from './SummaryRecommendationsModal';
import { fetchWrapper } from '@/utils/fetchWrapper';
import { Input } from '@/components/ui/input';
import { GenericTable, GenericTableColumn } from '@/components/ui/GenericTable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface UserUrl {
  url_id: string;
  url: string;
  created_at: string;
}

const PAGE_SIZE = 5;

export const ScansHistoryTable: React.FC<{ refresh?: boolean }> = ({ refresh }) => {
  const [urls, setUrls] = useState<UserUrl[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [viewUrlId, setViewUrlId] = useState<string | null>(null);
  const [viewDnsUrlId, setViewDnsUrlId] = useState<string | null>(null);
  const [viewHttpUrlId, setViewHttpUrlId] = useState<string | null>(null);
  const [viewVulnUrlId, setViewVulnUrlId] = useState<string | null>(null);
  const [viewSummaryUrlId, setViewSummaryUrlId] = useState<string | null>(null);
  const [deleteUrlId, setDeleteUrlId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { toast } = useToast();

  const fetchUrls = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      const response = await fetchWrapper('https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/urlscan/user-urls', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response && typeof response === 'object' && 'error' in response) {
        toast({
          variant: 'destructive',
          title: 'Error de Autenticación',
          description: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.',
        });
        setUrls([]);
        return;
      }
      if (!response || !response.ok) {
        const errorData = response ? await response.json().catch(() => ({})) : {};
        throw new Error(errorData.detail || errorData.message || 'Error al obtener el historial de URLs');
      }
      const data = await response.json();
      const sortedData = Array.isArray(data) ? data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) : [];
      setUrls(sortedData);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Error al obtener el historial de URLs',
      });
      setUrls([]);
    } finally {
      if (isInitial) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUrls(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (refresh !== undefined) {
      fetchUrls(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh]);

  const handleDeleteUrl = async () => {
    if (!deleteUrlId) return;
    try {
      setRefreshing(true);
      const response = await fetchWrapper(
        `https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/urlscan/user-urls/${deleteUrlId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (response && typeof response === 'object' && 'error' in response) {
        throw new Error(`Error al eliminar: ${response.error}`);
      }
      if (!response || !response.ok) {
        const data = response ? await response.json().catch(() => ({})) : {};
        throw new Error(data.detail || data.message || 'Error al eliminar la URL');
      }
      toast({
        variant: 'success',
        title: 'URL eliminada',
        description: 'La URL fue eliminada correctamente.',
      });
      setDeleteUrlId(null);
      fetchUrls(false);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err.message || 'No se pudo eliminar la URL.',
      });
      setRefreshing(false);
    }
  };

  // Búsqueda y paginación
  const filteredUrls = useMemo(() => {
    if (!searchTerm) return urls;
    return urls.filter(item =>
      item.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [urls, searchTerm]);

  const totalPages = Math.ceil(filteredUrls.length / PAGE_SIZE);
  const paginatedUrls = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredUrls.slice(start, start + PAGE_SIZE);
  }, [filteredUrls, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    } else if (filteredUrls.length > 0 && currentPage < 1) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage, filteredUrls.length]);

  const columns: GenericTableColumn<UserUrl>[] = [
    {
      key: 'url',
      label: 'URL',
      className: 'truncate max-w-xs',
    },
    {
      key: 'created_at',
      label: 'Fecha de escaneo',
      render: (row) => new Date(row.created_at).toLocaleString(),
    },
    {
      key: 'opciones',
      label: 'Opciones',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="ghost"
            title="SSL/TLS"
            aria-label="SSL/TLS"
            onClick={() => setViewUrlId(row.url_id)}
            className={`hover:text-green-600 ${viewUrlId === row.url_id ? 'text-green-600' : ''}`}
          >
            <ShieldCheck className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="DNS"
            aria-label="DNS"
            onClick={() => setViewDnsUrlId(row.url_id)}
            className={`hover:text-blue-600 ${viewDnsUrlId === row.url_id ? 'text-blue-600' : ''}`}
          >
            <Globe className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="SecurityHttp"
            aria-label="SecurityHttp"
            onClick={() => setViewHttpUrlId(row.url_id)}
            className={`hover:text-purple-600 ${viewHttpUrlId === row.url_id ? 'text-purple-600' : ''}`}
          >
            <Lock className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Vulnerabilidades"
            aria-label="Vulnerabilidades"
            onClick={() => setViewVulnUrlId(row.url_id)}
            className={`hover:text-red-600 ${viewVulnUrlId === row.url_id ? 'text-red-600' : ''}`}
          >
            <ShieldAlert className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Resumen"
            aria-label="Resumen"
            onClick={() => setViewSummaryUrlId(row.url_id)}
            className={`hover:text-cyan-600 ${viewSummaryUrlId === row.url_id ? 'text-cyan-600' : ''}`}
          >
            <FileText className="w-5 h-5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            title="Eliminar URL"
            aria-label="Eliminar URL"
            onClick={() => setDeleteUrlId(row.url_id)}
            className="hover:text-destructive"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
          </Button>
        </div>
      ),
      className: '',
    },
  ];

  return (
    <div className="relative max-w-5xl w-full mx-auto mt-8">
      <h2 className="text-xl font-bold mb-4">Historial de URLs escaneadas</h2>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <Input
          type="text"
          className="p-2 rounded border border-input w-full sm:w-64 bg-input text-foreground placeholder-muted-foreground focus:ring-ring focus:ring-2"
          placeholder="Buscar por URL..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <span className="text-xs text-muted-foreground ml-auto">
          Mostrando {paginatedUrls.length} de {filteredUrls.length} resultado{filteredUrls.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="overflow-x-auto w-full bg-card p-4 rounded-lg shadow">
        <GenericTable
          columns={columns}
          data={paginatedUrls}
          loading={loading}
          refreshing={refreshing}
          emptyMessage="No has escaneado ninguna URL aún."
          skeletonHeight="h-60"
        />
      </div>
      {/* Controles de Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            title="Anterior"
            className="hover:text-primary"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            title="Siguiente"
            className="hover:text-primary"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
      {/* Modal de detalles del escaneo SSL/TLS */}
      {viewUrlId && (
        <ScanResultModal
          urlId={viewUrlId}
          open={!!viewUrlId}
          onClose={() => setViewUrlId(null)}
        />
      )}
      {/* Modal de detalles del análisis DNS */}
      {viewDnsUrlId && (
        <DnsResultModal
          urlId={viewDnsUrlId}
          open={!!viewDnsUrlId}
          onClose={() => setViewDnsUrlId(null)}
        />
      )}
      {/* Modal de detalles del análisis HTTP */}
      {viewHttpUrlId && (
        <HttpResultModal
          urlId={viewHttpUrlId}
          open={!!viewHttpUrlId}
          onClose={() => setViewHttpUrlId(null)}
        />
      )}
      {/* Modal de detalles del análisis de vulnerabilidades */}
      {viewVulnUrlId && (
        <VulnResultModal
          urlId={viewVulnUrlId}
          open={!!viewVulnUrlId}
          onClose={() => setViewVulnUrlId(null)}
        />
      )}
      {/* Modal de detalles del resumen de recomendaciones */}
      {viewSummaryUrlId && (
        <SummaryRecommendationsModal
          urlId={viewSummaryUrlId}
          open={!!viewSummaryUrlId}
          onClose={() => setViewSummaryUrlId(null)}
        />
      )}
      {/* Modal de confirmación de eliminación */}
      <Dialog open={!!deleteUrlId} onOpenChange={() => setDeleteUrlId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar URL?</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            ¿Estás seguro que deseas eliminar esta URL y sus análisis asociados?
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDeleteUrl}
              disabled={refreshing}
            >
              Eliminar
            </Button>
            <DialogClose asChild>
              <Button variant="secondary" disabled={refreshing}>
                Cancelar
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};