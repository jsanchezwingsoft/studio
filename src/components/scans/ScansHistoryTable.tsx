'use client';
import React, { useEffect, useState, useMemo } from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScanResultModal } from './ScanResultModal';

interface UserUrl {
  url_id: string;
  url: string;
  created_at: string;
}

const PAGE_SIZE = 10;

export const ScansHistoryTable: React.FC = () => {
  const [urls, setUrls] = useState<UserUrl[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [viewUrlId, setViewUrlId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const { toast } = useToast();

  const fetchUrls = async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      const accessToken = sessionStorage.getItem('accessToken');
      const response = await fetch('https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/urlscan/user-urls', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      });
      if (!response.ok) throw new Error('Error al obtener el historial de URLs');
      const data = await response.json();
      setUrls(data);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Error al obtener el historial de URLs',
      });
    } finally {
      if (isInitial) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUrls(true);
  }, []);

  const handleDeleteUrl = async (url_id: string) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar esta URL y sus análisis asociados?')) return;
    try {
      setRefreshing(true);
      const accessToken = sessionStorage.getItem('accessToken');
      const response = await fetch(
        `https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/urlscan/user-urls/${url_id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || data.message || 'Error al eliminar la URL');
      }
      toast({
        variant: 'success',
        title: 'URL eliminada',
        description: 'La URL fue eliminada correctamente.',
      });
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
    // Si la búsqueda reduce la cantidad de páginas, ajusta la página actual
    if (currentPage > totalPages) setCurrentPage(1);
  }, [totalPages, currentPage]);

  return (
    <div className="relative">
      <h2 className="text-xl font-bold mb-4">Historial de URLs escaneadas</h2>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          className="p-2 rounded border border-gray-300 w-full sm:w-64"
          placeholder="Buscar por URL..."
          value={searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <span className="text-xs text-muted-foreground ml-auto">
          {filteredUrls.length} resultado{filteredUrls.length !== 1 ? 's' : ''}
        </span>
      </div>
      {loading ? (
        <Skeleton className="w-full h-60" />
      ) : (
        <>
          {refreshing && (
            <div className="absolute right-2 top-2 text-xs text-[#017979] animate-pulse z-10">
              Actualizando...
            </div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Fecha de escaneo</TableHead>
                <TableHead>Opciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedUrls.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    No has escaneado ninguna URL aún.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUrls.map((item) => (
                  <TableRow key={item.url_id}>
                    <TableCell>{item.url}</TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Ver detalles"
                          onClick={() => setViewUrlId(item.url_id)}
                        >
                          <Eye className="w-5 h-5 text-blue-600" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Eliminar URL"
                          onClick={() => handleDeleteUrl(item.url_id)}
                        >
                          <Trash2 className="w-5 h-5 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                title="Anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                title="Siguiente"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          )}
          {/* Modal de detalles del escaneo */}
          {viewUrlId && (
            <ScanResultModal
              urlId={viewUrlId}
              open={!!viewUrlId}
              onClose={() => setViewUrlId(null)}
            />
          )}
        </>
      )}
    </div>
  );
};