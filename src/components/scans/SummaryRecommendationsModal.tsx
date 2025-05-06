'use client';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  // Importa DialogDescription si la usas para accesibilidad
  DialogDescription // Añadir esta importación si usas <DialogDescription>
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Info, Download, User, Globe, Star, Award } from 'lucide-react';

// Importar fetchWrapper
import { fetchWrapper } from '@/utils/fetchWrapper';

// Importar pdfmake y las fuentes dinámicamente dentro de la función

interface SummaryRecommendationsModalProps {
  urlId: string | null;
  open: boolean;
  onClose: () => void;
}

// Mantén tus funciones de badge y helpers para la UI tal como están
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

const extractUrlFromResumen = (resumen: string): string | null => {
  if (!resumen) return null;
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const match = resumen.match(urlRegex);
  return match && match.length > 0 ? match[0] : null;
};

// Helper function to get color string for PDF text based on value and type
const getPdfColor = (type: 'score' | 'class' | 'security_grade' | 'severity', value: any): string => {
  if (type === 'score') {
    const score = Number(value);
    if (score >= 90) return "#0d9488"; // Teal-600
    if (score >= 70) return "#059669"; // Emerald-600
    if (score >= 50) return "#d97706"; // Amber-600
    return "#dc2626"; // Red-600
  } else if (type === 'class') {
    const upperValue = value?.toUpperCase();
    if (upperValue === "A+" || upperValue === "A") return "#0d9488"; // Teal-600
    if (upperValue === "B+" || upperValue === "B") return "#facc15"; // Yellow-400
    return "#dc2626"; // Red-600
  } else if (type === 'security_grade') {
    const upperValue = value?.toUpperCase();
     if (upperValue === "A+" || upperValue === "A") return "#0d9488";
     if (upperValue === "B+" || upperValue === "B") return "#059669";
     if (upperValue === "MEDIUM" || upperValue === "C+" || upperValue === "C") return "#d97706";
     return "#dc2626";
  } else if (type === 'severity') {
    const upperValue = value?.toUpperCase();
     if (upperValue === "HIGH" || upperValue === "CRITICAL") return "#dc2626"; // Red
     if (upperValue === "MEDIUM") return "#d97706"; // Orange
     if (upperValue === "LOW") return "#059669"; // Green
     return "#555555"; // Default grey or black
  }
  return "#000000"; // Default black
};


export const SummaryRecommendationsModal: React.FC<SummaryRecommendationsModalProps> = ({ urlId, open, onClose }) => {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<string>('');
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_API_URL || '';

  useEffect(() => {
    if (open && urlId) {
      setLoading(true);
      setError(null);
      setSummary(null);
      setUser(sessionStorage.getItem('username') || '');
      // === USAR fetchWrapper para obtener el resumen inicial ===
      // Este endpoint puede ser diferente al consolidado, pero asumimos que también requiere auth
      fetchWrapper(`${BASE_URL}/v1/urlscan/summary-recommendations/${urlId}`)
        .then(async (resOrError) => {
          if (resOrError && 'error' in resOrError) {
               if (resOrError.error === 'not_authenticated') {
                   setError("Su sesión ha expirado. Por favor, inicie sesión de nuevo.");
                   // Considera redirigir al login aquí si es un error de auth
               } else if (resOrError.error === 'not_found') {
                   setError(resOrError.message || 'Resumen no encontrado para este ID.');
               } else {
                   setError('Error al obtener el resumen.');
               }
               setSummary(null);
          } else if (resOrError) {
              const res = resOrError as Response; // Cast para tipado si es necesario
              const data = await res.json().catch(() => ({}));
              if (!res.ok) {
                const errorMessage = data.detail || data.message || `Error al obtener el resumen (Status: ${res.status})`;
                 console.error(`Error fetching summary (Status: ${res.status}):`, data);
                throw new Error(errorMessage);
              }
              // Si res.ok es true, los datos son válidos
              // Asumimos que este endpoint retorna un objeto similar con 'resumen', 'puntuacion', 'clasificacion', 'recomendaciones_detalladas'
              // Si 'recomendaciones_detalladas' viene como string JSON en este endpoint, necesitarías JSON.parse aquí.
              // Pero si viene como array directo, úsalo directamente.
              // Basado en el JSON de ejemplo y el código consolidado, debería ser un array directo.
              setSummary(data); // Asigna la respuesta completa al estado summary
          } else {
               console.error("fetchWrapper retornó un valor inesperado para el resumen:", resOrError);
               setError('Error inesperado al obtener resumen.');
               setSummary(null);
          }
        })
        .catch((e) => {
           console.error("Error capturado al usar fetchWrapper para el resumen:", e);
           setError(e.message);
           setSummary(null);
        })
        .finally(() => setLoading(false));
    }
  }, [open, urlId, BASE_URL]); // Asegúrate de que BASE_URL esté en las dependencias

  const resumenUrl = summary?.resumen ? extractUrlFromResumen(summary.resumen) : null;

  // === Lógica de PDF con pdfmake ===
  const handleDownloadPDF = async () => {
    if (!urlId) return;

    let puertos: any[] = []; // Declarar puertos con let fuera del try

    try {
      // === Importar pdfmake y fuentes dinámicamente ===
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');

      const pdfMake = pdfMakeModule.default;
      const pdfFonts = pdfFontsModule.default;

      // Configurar las fuentes - DEBE ocurrir DESPUÉS de importar
      pdfMake.vfs = pdfFonts.vfs;


      // === USAR fetchWrapper para obtener los datos consolidados ===
      const resOrError = await fetchWrapper(`${BASE_URL}/v1/urlscan/consolidated-url-info/${urlId}`);

      let apiData;
      if (resOrError && 'error' in resOrError) {
         if (resOrError.error === 'not_authenticated') {
             setError("Su sesión ha expirado o requiere autenticación para descargar. Por favor, inicie sesión de nuevo.");
             return;
         } else if (resOrError.error === 'not_found') {
             setError(resOrError.message || 'Datos consolidados no encontrados para este ID.');
             return;
         } else {
              console.error("fetchWrapper retornó un error:", resOrError);
              setError('Error al obtener datos para el informe PDF.');
              return;
         }
      } else if (resOrError) {
          const res = resOrError as Response; // Cast para tipado si es necesario
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
             const errorMessage = data.detail || data.message || `Error al obtener datos consolidados (Status: ${res.status})`;
             console.error(`Error fetching consolidated data (Status: ${res.status}):`, data);
             throw new Error(errorMessage);
          }
          apiData = data; // apiData ahora contiene el objeto completo de la API
      } else {
          console.error("fetchWrapper retornó un valor inesperado:", resOrError);
          setError('Error inesperado al obtener datos para el informe PDF.');
          return;
      }


      // --- Extraer y asignar datos desde apiData ---
      // Usar ?. para acceso seguro y || '-' para valores por defecto
      const user = sessionStorage.getItem('username') || '-';
      const url = apiData.data?.url_info?.url || '-';

      const resumen = apiData.data?.summary_recommendations?.Resumen || '-';
      const puntuacion = Number(apiData.data?.summary_recommendations?.Puntuacion) || 0;
      const clasificacion = apiData.data?.summary_recommendations?.Clasificacion ?? '-';

      // === CORRECCIÓN: Asumimos que Recomendaciones ya es un array del backend ===
      // Basado en el código backend que parsea json.loads(summary_json)
      const recomendaciones: string[] = Array.isArray(apiData.data?.summary_recommendations?.Recomendaciones)
                                         ? apiData.data.summary_recommendations.Recomendaciones.map(item => String(item)) // Asegurar que sean strings
                                         : (apiData.data?.summary_recommendations?.Recomendaciones ? [String(apiData.data.summary_recommendations.Recomendaciones)] : []); // Fallback: si no es array pero existe, tratar como 1 item; si no existe, array vacío
      // === FIN CORRECCIÓN ===


      const sslScan = apiData.data?.ssl_scan;
      const dnsScan = apiData.data?.dns_scan;
      const httpScan = apiData.data?.http_scan;
      const vulnScan = apiData.data?.vuln_scan;

      // Asignar puertos (lógica existente)
      puertos = vulnScan?.puertos_abiertos || sslScan?.puertos_abiertos || [];


      // --- Definición del documento PDF con pdfmake con MEJORAS VISUALES ---
      const docDefinition: any = {
        content: [
          // --- Encabezado principal ---
          {
            stack: [
              { text: 'Informe Consolidado de Seguridad', style: 'header' },
              {
                  columns: [
                     { text: `Generado por: MiniHack Analyzer | wingsoftlab.com`, style: 'subheader', width: '*' },
                     { text: `Fecha de descarga: ${new Date().toLocaleString()}`, style: 'subheader', alignment: 'right', width: '*' },
                  ],
                  margin: [0, 5, 0, 2]
              },
               {
                  columns: [
                     { text: `Usuario: ${user}`, style: 'subheader', width: '*' },
                     { text: `URL del sitio: ${url}`, style: 'subheader', alignment: 'right', width: '*' },
                  ],
                  margin: [0, 2, 0, 15] // Margen inferior
              },
            ],
            margin: [0, 0, 0, 0],
          },
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#cccccc' }], margin: [0, 0, 0, 20] }, // Línea separadora


          // --- Sección Resumen Ejecutivo ---
          { text: 'Resumen ejecutivo', style: 'sectionHeader' },
          { text: resumen, style: 'body', margin: [0, 0, 0, 20] }, // Añadir margen inferior

          // --- Sección Puntuación y clasificación ---
          { text: 'Puntuación y clasificación', style: 'sectionHeader' },
          {
            columns: [
              {
                width: 'auto',
                text: [
                  { text: 'Puntuación General: ', bold: true },
                  { text: `${puntuacion}`, color: getPdfColor('score', puntuacion) }
                ],
                 margin: [0, 0, 20, 0]
              },
              {
                 width: 'auto',
                 text: [
                    { text: 'Clasificación General: ', bold: true },
                    { text: `${clasificacion}`, color: getPdfColor('class', clasificacion) }
                 ],
                 margin: [0, 0, 0, 0]
              },
              ...(sslScan?.clasificacion ? [{
                 width: 'auto', text: [{ text: 'Clasificación SSL: ', bold: true }, { text: `${sslScan.clasificacion}`, color: getPdfColor('class', sslScan.clasificacion) }], margin: [20, 0, 0, 0] }] : []),
               ...(httpScan?.security_grade ? [{
                 width: 'auto', text: [{ text: 'Calificación HTTP: ', bold: true }, { text: `${httpScan.security_grade}`, color: getPdfColor('security_grade', httpScan.security_grade) }], margin: [20, 0, 0, 0] }] : []),
            ],
             margin: [0, 0, 0, 20]
          },


          // --- Sección Recomendaciones detalladas ---
          { text: 'Recomendaciones detalladas', style: 'sectionHeader' },
          recomendaciones.length > 0
            ? { ul: recomendaciones.map((rec: string) => ({ text: rec, margin: [0, 2] })), margin: [0, 0, 0, 20] }
            : { text: '-', style: 'body', margin: [0, 0, 0, 20] },


          // --- Secciones de Detalles ---

          ...(sslScan ? [{
            stack: [
               { text: 'Detalles SSL/TLS', style: 'sectionHeader', margin: [0, 15, 0, 5] },
               { columns: [{text: 'Protocolo:', bold: true, width: '30%'}, {text: sslScan.protocolo || '-', width: '*'}], margin: [0, 2] },
               { columns: [{text: 'Cifrado:', bold: true, width: '30%'}, {text: sslScan.cifrado || '-', width: '*'}], margin: [0, 2] },
               { columns: [{text: 'Tamaño Clave:', bold: true, width: '30%'}, {text: sslScan.tamano_clave ? `${sslScan.tamano_clave} bits` : '-', width: '*'}], margin: [0, 2] },
               { columns: [{text: 'Grupo Key Exchange:', bold: true, width: '30%'}, {text: sslScan.key_exchange_group || '-', width: '*'}], margin: [0, 2] },
               { columns: [{text: 'Algoritmo Clave:', bold: true, width: '30%'}, {text: sslScan.algoritmo_clave || '-', width: '*'}], margin: [0, 2] },
               { columns: [{text: 'Validez:', bold: true, width: '30%'}, {text: `${sslScan.validez_desde || '-'} hasta ${sslScan.validez_hasta || '-'}` , width: '*'},], margin: [0, 2] },
               { columns: [{text: 'Estado de Validez:', bold: true, width: '30%'}, {text: sslScan.validez_estado || '-', width: '*'}], margin: [0, 2] },
               { columns: [{text: 'Emisor:', bold: true, width: '30%'}, {text: sslScan.emisor || '-', width: '*'}], margin: [0, 2] },
               { columns: [{text: 'Revocación:', bold: true, width: '30%'}, {text: sslScan.revocacion || '-'}], margin: [0, 2] },
               { columns: [{text: 'Autofirmado:', bold: true, width: '30%'}, {text: sslScan.autofirmado !== undefined ? (sslScan.autofirmado ? 'Sí' : 'No') : '-', width: '*'}], margin: [0, 2] },
               { columns: [{text: 'Calificación Seguridad:', bold: true, width: '30%'}, {text: sslScan.calificacion_seguridad || '-', width: '*'}], margin: [0, 2] },
               ...(sslScan.recomendaciones ? [{ columns: [{text: 'Recomendaciones SSL:', bold: true, width: '30%'}, {text: sslScan.recomendaciones, width: '*'}], margin: [0, 2] }] : []),
            ], margin: [0, 0, 0, 20]
          }] : []), ...(sslScan ? [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#eeeeee' }], margin: [0, 0, 0, 20] }] : []),

          ...(dnsScan ? [{
             stack: [
                { text: 'Detalles DNS y WHOIS', style: 'sectionHeader', margin: [0, 15, 0, 5] },
                { text: 'Registros DNS:', style: 'body', bold: true, margin: [0,5,0,2] },
                ...(dnsScan.registros_a?.length > 0 ? [{ text: 'A:', style: 'body', margin: [0,2,0,0] }, { ul: dnsScan.registros_a, margin: [10,0,0,5], fontSize: 11 }] : []),
                ...(dnsScan.registros_aaaa?.length > 0 ? [{ text: 'AAAA:', style: 'body', margin: [0,2,0,0] }, { ul: dnsScan.registros_aaaa, margin: [10,0,0,5], fontSize: 11 }] : []),
                ...(dnsScan.registros_cname?.length > 0 ? [{ text: 'CNAME:', style: 'body', margin: [0,2,0,0] }, { ul: dnsScan.registros_cname, margin: [10,0,0,5], fontSize: 11 }] : []),
                ...(dnsScan.registros_mx?.length > 0 ? [{ text: 'MX:', style: 'body', margin: [0,2,0,0] }, { ul: dnsScan.registros_mx, margin: [10,0,0,5], fontSize: 11 }] : []),
                ...(dnsScan.registros_ns?.length > 0 ? [{ text: 'NS:', style: 'body', margin: [0,2,0,0] }, { ul: dnsScan.registros_ns, margin: [10,0,0,5], fontSize: 11 }] : []),
                ...(dnsScan.registros_txt?.length > 0 ? [{ text: 'TXT:', style: 'body', margin: [0,2,0,0] }, { ul: dnsScan.registros_txt, margin: [10,0,0,5], fontSize: 11 }] : []),
                { columns: [{text: 'Proveedor DNS:', bold: true, width: '30%'}, {text: dnsScan.proveedor_dns || '-', width: '*'}], margin: [0, 5] },
                { columns: [{text: 'DNSSEC Habilitado:', bold: true, width: '30%'}, {text: dnsScan.dnssec_habilitado !== undefined ? (dnsScan.dnssec_habilitado ? 'Sí' : 'No') : '-', width: '*'}], margin: [0, 2] },
                 ...(dnsScan.dnssec_detalles ? [{ columns: [{text: 'Detalles DNSSEC:', bold: true, width: '30%'}, {text: dnsScan.dnssec_detalles, width: '*'}], margin: [0, 2] }] : []),

                { text: 'WHOIS:', style: 'body', bold: true, margin: [0,10,0,2] },
                { columns: [{text: 'Nombre Dominio:', bold: true, width: '30%'}, {text: dnsScan.whois_nombre_dominio || '-', width: '*'}], margin: [0, 2] },
                { columns: [{text: 'Registrador:', bold: true, width: '30%'}, {text: dnsScan.whois_registrador || '-', width: '*'}], margin: [0, 2] },
                { columns: [{text: 'Fecha Creación:', bold: true, width: '30%'}, {text: dnsScan.whois_fecha_creacion || '-', width: '*'}], margin: [0, 2] },
                { columns: [{text: 'Fecha Expiración:', bold: true, width: '30%'}, {text: dnsScan.whois_fecha_expiracion || '-', width: '*'}], margin: [0, 2] },
                 ...(dnsScan.whois_servidores_nombres?.length > 0 ? [{ text: 'Servidores Nombres (WHOIS):', bold: true, margin: [0,5,0,2] }, { ul: dnsScan.whois_servidores_nombres, margin: [10,0,0,5], fontSize: 11 }] : []),
                 ...(dnsScan.whois_correos_electronicos?.length > 0 ? [{ text: 'Correos Electrónicos (WHOIS):', bold: true, margin: [0,5,0,2] }, { ul: dnsScan.whois_correos_electronicos, margin: [10,0,0,5], fontSize: 11 }] : []),
                 { columns: [{text: 'Organización (WHOIS):', bold: true, width: '30%'}, {text: dnsScan.whois_organizacion || '-', width: '*'}], margin: [0, 2] },
                 { columns: [{text: 'País (WHOIS):', bold: true, width: '30%'}, {text: dnsScan.whois_pais || '-', width: '*'}], margin: [0, 2] },
                 ...(dnsScan.whois_error ? [{ columns: [{text: 'Error WHOIS:', bold: true, width: '30%'}, {text: dnsScan.whois_error, width: '*'}], margin: [0, 2] }] : []),
             ], margin: [0, 0, 0, 20]
          }] : []), ...(dnsScan ? [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#eeeeee' }], margin: [0, 0, 0, 20] }] : []),

           ...(httpScan ? [{
             stack: [
                { text: 'Detalles HTTP y Seguridad', style: 'sectionHeader', margin: [0, 15, 0, 5] },
                { columns: [{text: 'Calificación Seguridad HTTP:', bold: true, width: '30%'}, {text: httpScan.security_grade || '-', width: '*'}], margin: [0, 5] },

                { text: 'Cabeceras de Seguridad HTTP:', style: 'body', bold: true, margin: [0,10,0,2] },
                ...(httpScan.http_security && Object.keys(httpScan.http_security).length > 0 ? [{
                  ul: Object.entries(httpScan.http_security).map(([key, value]) =>
                     ({ text: [{text: `${key}: `, bold: true}, `${value || '-'} `], margin: [0,1], fontSize: 11 })
                  ), margin: [0,0,0,10]
                }] : [{ text: '- No hay cabeceras de seguridad HTTP destacadas.', style: 'body', margin: [10,0,0,10], italics: true }]),

                 { text: 'Reglas robots.txt:', style: 'body', bold: true, margin: [0,10,0,2] },
                 { text: httpScan.crawl_rules?.['robots.txt'] || 'No disponible', style: 'body', margin: [0,0,0,10], fontSize: 11 },

                 ...(httpScan.social_tags && Object.keys(httpScan.social_tags).length > 0 ? [{
                     text: 'Meta Tags (Social/SEO):', style: 'body', bold: true, margin: [0,10,0,2]
                 }, {
                     ul: Object.entries(httpScan.social_tags).map(([key, value]) =>
                         ({ text: [{text: `${key}: `, bold: true}, `${value || '-'} `], margin: [0,1], fontSize: 11 })
                     ), margin: [0,0,0,10]
                 }] : []),

                  ...(httpScan.redirects?.length > 0 ? [{
                     text: 'Redirecciones:', style: 'body', bold: true, margin: [0,10,0,2]
                  }, { ul: httpScan.redirects.map((redirect: string) => redirect), margin: [0,0,0,10], fontSize: 11 }] : []),

                  ...(httpScan.errors?.length > 0 ? [{
                      text: 'Errores HTTP Scan:', style: 'body', bold: true, margin: [0,10,0,2], color: 'red'
                  }, { ul: httpScan.errors.map((error: string) => error), margin: [0,0,0,10], fontSize: 11, color: 'red' }] : []),

             ], margin: [0, 0, 0, 20]
          }] : []), ...(httpScan ? [{ canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.5, lineColor: '#eeeeee' }], margin: [0, 0, 0, 20] }] : []),


          // --- Sección Puertos abiertos ---
           ...(puertos.length > 0 ? [{
              stack: [
                { text: 'Puertos abiertos', style: 'sectionHeader', margin: [0, 15, 0, 5] },
                 {
                    table: {
                      widths: ['auto', '*', '*', '*', '*'],
                      headerRows: 1,
                      body: [
                        [ { text: 'Puerto', style: 'tableHeader' }, { text: 'Servicio', style: 'tableHeader' }, { text: 'Producto', style: 'tableHeader' }, { text: 'Versión', style: 'tableHeader' }, { text: 'CPE', style: 'tableHeader' } ],
                        ...(puertos.map((p: any, index: number) => [
                           { text: p.port || '-', style: (index % 2 === 0 ? 'tableBodyOdd' : 'tableBodyEven') },
                           { text: p.service || '-', style: (index % 2 === 0 ? 'tableBodyOdd' : 'tableBodyEven') },
                           { text: p.product || '-', style: (index % 2 === 0 ? 'tableBodyOdd' : 'tableBodyEven') },
                           { text: p.version || '-', style: (index % 2 === 0 ? 'tableBodyOdd' : 'tableBodyEven') },
                           { text: p.cpe || '-', style: (index % 2 === 0 ? 'tableBodyOdd' : 'tableBodyEven') }
                        ]))
                      ]
                    },
                    layout: {
                        hLineWidth: function(i: number, node: any) { return (i === 0 || i === node.table.body.length) ? 0.8 : 0.4; },
                        vLineWidth: function(i: number, node: any) { return 0; },
                        hLineColor: function(i: number, node: any) { return (i === 0 || i === node.table.body.length) ? '#aaaaaa' : '#dddddd'; },
                        vLineColor: function(i: number, node: any) { return '#dddddd'; },
                        fillColor: function(rowIndex: number, node: any, columnIndex: number) { return (rowIndex === 0) ? '#f5f5f5' : null; }, // Fondo solo para el header
                        paddingLeft: function(i: number, node: any) { return 8; },
                        paddingRight: function(i: number, node: any) { return 8; },
                        paddingTop: function(i: number, node: any) { return 5; },
                        paddingBottom: function(i: number, node: any) { return 5; },
                    },
                    margin: [0, 0, 0, 20]
                  }
               ]
           }] : [{ text: 'Puertos abiertos', style: 'sectionHeader', margin: [0, 15, 0, 5] }, { text: '- No se detectaron puertos abiertos', style: 'body', margin: [0, 0, 0, 20] }]),


          // --- Sección Vulnerabilidades agrupadas ---
           ...(vulnScan?.vulnerabilidades?.length > 0 ? [{
               stack: [
                  { text: 'Vulnerabilidades detectadas por servicio/puerto', style: 'sectionHeader', margin: [0, 15, 0, 5] },
                  ...vulnScan.vulnerabilidades.map((grupo: any) => ({
                    stack: [
                      { text: `> ${grupo.puerto_servicio}`, style: 'body', bold: true, margin: [0, 5, 0, 2] },
                      grupo.cves?.length > 0
                        ? {
                            stack: grupo.cves.map((cve: any) => ({
                              stack: [
                                { text: `CVE: ${cve.cve_id || 'N/A'}`, bold: true, fontSize: 11 },
                                ...(cve.severidad ? [{ columns: [{ text: 'Severidad:', bold: true, width: 'auto' }, { text: cve.severidad, width: '*', color: getPdfColor('severity', cve.severidad) }], margin: [10, 0, 0, 0], fontSize: 11 }] : []),
                                 ...(cve.cwe && cve.cwe.length > 0 ? [{ columns: [{ text: 'CWE:', bold: true, width: 'auto' }, { text: cve.cwe.join(', ') || '-', width: '*' }], margin: [10, 0, 0, 0], fontSize: 11 }] : []),
                                ...(cve.descripcion ? [{ columns: [{ text: 'Descripción:', bold: true, width: 'auto' }, { text: cve.descripcion || '-', width: '*' }], margin: [10, 0, 0, 0], fontSize: 11 }] : []),
                                ...(cve.enlace_cve ? [{ columns: [{ text: 'Enlace:', bold: true, width: 'auto' }, { text: cve.enlace_cve, link: cve.enlace_cve, color: 'blue', width: '*' }], margin: [10, 0, 0, 0], fontSize: 11 }] : []),
                                ...(cve.referencias && cve.referencias.length > 0 ? [
                                    { text: 'Referencias:', bold: true, margin: [10, 5, 0, 0], fontSize: 11 },
                                    { ul: cve.referencias.map((ref: string) => ({ text: ref || '-', margin: [0, 0, 0, 0] })), margin: [20,0,0,5], fontSize: 10 }
                                  ] : []),
                              ], margin: [0, 0, 0, 8],
                            }))
                          }
                        : { text: '- No se encontraron CVEs relevantes para este servicio.', margin: [10, 5], italics: true, fontSize: 11 }
                    ], margin: [0, 0, 0, 15]
                  }))
               ]
           }] : [{ text: 'Vulnerabilidades detectadas por servicio/puerto', style: 'sectionHeader', margin: [0, 15, 0, 5] }, { text: '- No se detectaron vulnerabilidades conocidas.', style: 'body', margin: [0, 0, 0, 20] }]),


        ],
        // --- Estilos ---
        styles: {
          header: { fontSize: 26, bold: true, margin: [0, 0, 0, 5], color: '#333333' },
          subheader: { fontSize: 10, margin: [0, 1, 0, 1], color: '#555555' },
          sectionHeader: { fontSize: 18, bold: true, margin: [0, 20, 0, 10], color: '#333333' },
          body: { fontSize: 12, lineHeight: 1.4 },
          tableHeader: { bold: true, fontSize: 10, color: '#555555' },
          tableBodyOdd: { fontSize: 10 }, // Estilo sin fondo explícito para filas impares
          tableBodyEven: { fontSize: 10, fillColor: '#f9f9f9' }, // Gris muy claro para striping en filas pares
        },
        defaultStyle: { font: 'Roboto', fontSize: 12, lineHeight: 1.4 },
        // Pie de página
         footer: function(currentPage: number, pageCount: number) {
             return {
                 columns: [
                     { text: 'Generado por MiniHack Analyzer | wingsoftlab.com', alignment: 'left', margin: [15, 0, 0, 0] },
                     { text: `Página ${currentPage.toString()} de ${pageCount}`, alignment: 'right', margin: [0, 0, 15, 0] }
                 ],
                 fontSize: 9,
                 color: '#888888'
             };
         }
      };


      // Crear y descargar el PDF
      pdfMake.createPdf(docDefinition).download(`analisis_detallado_${urlId}.pdf`);

    } catch (err) {
      console.error("Error capturado al generar el PDF:", err);
      setError(err.message || "No se pudo generar el informe PDF debido a un error inesperado. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full">
         {/* === Añadir DialogDescription para accesibilidad === */}
         <DialogDescription className="sr-only">
             {/* Texto descriptivo para lectores de pantalla, puede ser simple */}
             Informe consolidado de seguridad para la URL analizada.
         </DialogDescription>
         {/* === Fin DialogDescription === */}
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
        ) : error && !summary ? ( // Mostrar error si no hay summary cargado
          <div className="py-6 text-center text-red-600">{error}</div>
        ) : summary ? (
          <div className="py-2 space-y-6 text-base bg-card rounded max-h-[400px] overflow-y-auto pr-2">
            <div className="mb-4 border-b pb-2">
              <div className="text-2xl font-bold mb-2 flex items-center gap-2">
                Resumen ejecutivo
                <Info className="w-4 h-4 text-muted-foreground" title="Resumen general del estado de seguridad de la URL." />
              </div>
              <div className="ml-2">{summary.resumen || '-'}</div>
            </div>
            <div className="mb-4 border-b pb-2">
              <span className="font-semibold flex items-center gap-1">
                Recomendaciones detalladas
                <Info className="w-4 h-4 text-muted-foreground" title="Acciones sugeridas para mejorar la seguridad y reducir riesgos." />
              </span>
              {/* Usar el summary cargado en el estado para mostrar las recomendaciones */}
              {/* Asumimos que summary.recomendaciones_detalladas ya es un array */}
              {Array.isArray(summary.recomendaciones_detalladas) && summary.recomendaciones_detalladas.length > 0 ? (
                <ul className="list-disc pl-5 text-base space-y-1 break-all">
                  {summary.recomendaciones_detalladas.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              ) : (
                <span className="ml-2 text-muted-foreground">-</span>
              )}
            </div>
            {/* Resto de la UI que usa 'summary' del estado */}
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
            <div className="mb-2 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-semibold">Usuario:</span>
                <span>{user || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="font-semibold">URL del sitio:</span>
                {summary.resumen ? (
                  <a href={extractUrlFromResumen(summary.resumen) || '#'} target="_blank" rel="noopener noreferrer" className="text-[#017979] font-semibold underline hover:text-[#015e5e]">
                    {extractUrlFromResumen(summary.resumen) || '-'}
                  </a>
                ) : (
                  <span>-</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Fecha del análisis:</span>
                <span>{new Date().toLocaleString()}</span> {/* Note: This shows current time, not scan time from API */}
              </div>
            </div>
            <div className="mt-4 text-xs text-center text-muted-foreground border-t pt-2">
              <span>Generado por MiniHack Analyzer | wingsoftlab.com</span>
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">No hay datos para mostrar.</div>
        )}
        <DialogFooter>
           {/* Deshabilita el botón si no hay summary cargado */}
          <Button type="button" onClick={handleDownloadPDF} variant="primary" disabled={loading || !summary}>
             <Download className="mr-2 h-4 w-4" /> Descargar Informe PDF
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