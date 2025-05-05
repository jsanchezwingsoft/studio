'use client';
import React from 'react';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export interface GenericTableColumn<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface GenericTableProps<T> {
  columns: GenericTableColumn<T>[];
  data: T[];
  loading?: boolean;
  refreshing?: boolean;
  emptyMessage?: string;
  skeletonHeight?: string;
}

export function GenericTable<T extends { [key: string]: any }>({
  columns,
  data,
  loading = false,
  refreshing = false,
  emptyMessage = 'No hay datos para mostrar.',
  skeletonHeight = 'h-60',
}: GenericTableProps<T>) {
  return (
    <div className="relative bg-card p-4 rounded-lg shadow max-w-5xl w-full mx-auto">
      {loading ? (
        <div>
          <div className={`w-full ${skeletonHeight}`}>
            <Skeleton className="w-full h-full bg-muted rounded-md" />
          </div>
        </div>
      ) : (
        <>
          {refreshing && (
            <div className="absolute right-2 top-2 text-xs text-[#017979] animate-pulse z-10">
              Actualizando...
            </div>
          )}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((col) => (
                    <TableHead key={col.key as string} className={col.className}>{col.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-8">
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row, idx) => (
                    <TableRow key={row.url_id || row.user_id || idx}>
                      {columns.map((col) => (
                        <TableCell key={col.key as string} className={col.className}>
                          {col.render ? col.render(row) : row[col.key as keyof T]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}