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
import { Lock, Loader2 } from 'lucide-react';

interface HttpResultModalProps {
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

const securityHeaderTooltips: Record<string, string> = {
  "Strict-Transport-Security": "Protege contra ataques de downgrade y secuestro de cookies forzando HTTPS.",
  "Content-Security-Policy": "Previene ataques XSS y de inyección restringiendo fuentes de contenido.",
  "X-Frame-Options": "Previene ataques de clickjacking.",
  "X-Content-Type-Options": "Previene ataques de MIME sniffing.",
  "Referrer-Policy": "Controla la información de referencia enviada.",
  "Permissions-Policy": "Restringe el acceso a APIs y funcionalidades del navegador.",
  "X-XSS-Protection": "Filtro XSS legacy (no recomendado en navegadores modernos)."
};

const cookieBadgeTooltip = {
  "Sesión de usuario": "Cookie utilizada para mantener la sesión del usuario.",
  "Google Analytics / Tracking": "Cookie utilizada para tracking de Google Analytics.",
  "Facebook / Tracking": "Cookie utilizada para tracking de Facebook.",
  "Insegura (sin Secure)": "Cookie enviada también por HTTP, no solo HTTPS.",
  "Accesible por JS (sin HttpOnly)": "Cookie accesible desde JavaScript, potencialmente vulnerable.",
  "SameSite=None sin Secure (vulnerable)": "Cookie con SameSite=None pero sin Secure, potencialmente vulnerable."
};

const crawlRuleBadgeTooltip = {
  "Bloqueo de área sensible": "El robots.txt bloquea rutas potencialmente sensibles.",
  "Bloqueo de recursos estáticos": "El robots.txt bloquea recursos estáticos.",
  "Bloqueo general de todo el sitio": "El robots.txt bloquea todo el sitio a los bots.",
  "Configuración detallada de reglas de rastreo": "El robots.txt tiene muchas reglas específicas.",
  "Configuración básica de reglas de rastreo": "El robots.txt tiene algunas reglas básicas.",
  "No se especifican reglas de rastreo": "No hay reglas de rastreo en el robots.txt.",
  "Conflicto detectado": "Hay conflicto entre Allow y Disallow.",
  "Sitemaps proporcionados para mejorar el rastreo": "El robots.txt declara sitemaps.",
  "No se proporcionan sitemaps en robots.txt": "No hay sitemaps declarados.",
  "Reglas específicas para user-agents": "El robots.txt tiene reglas para bots específicos.",
  "Posible leak de información": "El robots.txt menciona rutas sensibles."
};

export const HttpResultModal: React.FC<HttpResultModalProps> = ({ urlId, open, onClose }) => {
  const [httpResult, setHttpResult] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && urlId) {
      setLoading(true);
      setError(null);
      setHttpResult(null);
      const accessToken = sessionStorage.getItem('accessToken');
      fetch(`https://coreapihackanalizerdeveloper.wingsoftlab.com/v1/urlscan/http-result/${urlId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.detail || data.message || 'Error al obtener el resultado HTTP');
          }
          setHttpResult(data);
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

  const renderCookies = (cookies: any[]) =>
    cookies && cookies.length > 0 ? (
      <table className="min-w-full border text-xs mb-2">
        <thead>
          <tr>
            <th className="p-1 border">Nombre</th>
            <th className="p-1 border">Dominio</th>
            <th className="p-1 border">Ruta</th>
            <th className="p-1 border">Secure</th>
            <th className="p-1 border">HttpOnly</th>
            <th className="p-1 border">SameSite</th>
            <th className="p-1 border">Max-Age</th>
            <th className="p-1 border">Expira</th>
            <th className="p-1 border">Casos de uso</th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((c, idx) => (
            <tr key={idx}>
              <td className="p-1 border">{c.nombre}</td>
              <td className="p-1 border">{c.dominio}</td>
              <td className="p-1 border">{c.ruta}</td>
              <td className="p-1 border">{c.secure ? 'Sí' : 'No'}</td>
              <td className="p-1 border">{c.httponly ? 'Sí' : 'No'}</td>
              <td className="p-1 border">{c.samesite}</td>
              <td className="p-1 border">{c['max-age']}</td>
              <td className="p-1 border">{c.expira}</td>
              <td className="p-1 border">
                {(c.casos_de_uso || []).map((uc: string, i: number) =>
                  <span key={i} className="mr-1">
                    {badge(uc, 'bg-blue-100 text-blue-800', cookieBadgeTooltip[uc] || uc)}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <span className="text-muted-foreground">-</span>
    );

  const renderBadges = (items: string[], tooltipMap: Record<string, string>) =>
    items && items.length > 0 ? (
      <div className="flex flex-wrap gap-1">
        {items.map((item, idx) => (
          <span key={idx}>
            {badge(item, 'bg-blue-100 text-blue-800', tooltipMap[item] || item)}
          </span>
        ))}
      </div>
    ) : (
      <span className="text-muted-foreground">-</span>
    );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full">
        <DialogHeader>
          <DialogTitle>
            <span className="flex items-center gap-2">
              <Lock className="w-6 h-6 text-[#017979]" />
              Detalle del análisis HTTP de la URL
            </span>
          </DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="py-6 text-center flex flex-col items-center gap-2">
            <Loader2 className="animate-spin w-8 h-8 text-[#017979]" />
            <span>Cargando análisis HTTP...</span>
          </div>
        ) : error ? (
          <div className="py-6 text-center text-red-600">{error}</div>
        ) : httpResult ? (
          <div className="py-2 space-y-4 text-sm bg-card rounded max-h-[400px] overflow-y-auto pr-2">
            {/* 1. Encabezados de Seguridad HTTP */}
            <div className="border-b pb-2">
              <h3 className="font-semibold mb-1">1. Encabezados de Seguridad HTTP</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {Object.entries(httpResult["1. Encabezados de Seguridad HTTP"] || {}).map(([key, value]) => (
                  key !== "Información" && (
                    <div key={key}>
                      <span className="font-semibold">{key}:</span>{" "}
                      {value
                        ? badge("Presente", "bg-green-200 text-green-800", securityHeaderTooltips[key] || key)
                        : badge("Ausente", "bg-red-200 text-red-800", securityHeaderTooltips[key] || key)}
                      <span className="ml-2">{value || '-'}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
            {/* 2. Metatags Sociales */}
            <div className="border-b pb-2">
              <h3 className="font-semibold mb-1">2. Metatags Sociales</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {Object.entries(httpResult["2. Metatags Sociales"] || {}).map(([key, value]) => (
                  key !== "Información" && (
                    <div key={key}>
                      <span className="font-semibold">{key}:</span>{" "}
                      {value
                        ? badge("Presente", "bg-green-200 text-green-800")
                        : badge("Ausente", "bg-gray-200 text-gray-800")}
                      <span className="ml-2">{value || '-'}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
            {/* 3. Análisis de Cookies */}
            <div className="border-b pb-2">
              <h3 className="font-semibold mb-1">3. Análisis de Cookies</h3>
              {renderCookies(httpResult["3. Análisis de Cookies"]?.Cookies || [])}
              <div>
                <span className="font-semibold">Casos de Uso:</span>{" "}
                {renderBadges(httpResult["3. Análisis de Cookies"]?.["Casos de Uso"] || [], cookieBadgeTooltip)}
              </div>
            </div>
            {/* 4. Reglas de Rastreo */}
            <div className="border-b pb-2">
              <h3 className="font-semibold mb-1">4. Reglas de Rastreo</h3>
              <details className="mb-2 bg-muted rounded p-2">
                <summary className="cursor-pointer font-semibold">Ver robots.txt completo</summary>
                <pre className="text-xs max-h-32 overflow-y-auto whitespace-pre-wrap">{httpResult["4. Reglas de Rastreo"]?.["robots.txt"] || '-'}</pre>
              </details>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                <div>
                  <span className="font-semibold">Disallow:</span>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {(httpResult["4. Reglas de Rastreo"]?.Disallow || []).map((path: string, idx: number) => (
                      <li key={idx}>
                        {path}
                        {httpResult["4. Reglas de Rastreo"]?.RutasSensibles?.includes(path) && (
                          <span className="ml-2 px-2 py-1 rounded bg-red-200 text-red-800 text-xs" title="Ruta sensible">
                            Sensible
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="font-semibold">Allow:</span>
                  {renderList(httpResult["4. Reglas de Rastreo"]?.Allow || [])}
                </div>
                <div>
                  <span className="font-semibold">Sitemap:</span>
                  {renderList(httpResult["4. Reglas de Rastreo"]?.Sitemap || [])}
                </div>
                <div>
                  <span className="font-semibold">User-agent:</span>
                  {renderList(httpResult["4. Reglas de Rastreo"]?.["User-agent"] || [])}
                </div>
                <div>
                  <span className="font-semibold">Crawl-delay:</span>{" "}
                  {httpResult["4. Reglas de Rastreo"]?.["Crawl-delay"] || '-'}
                </div>
                <div>
                  <span className="font-semibold">RutasSensibles:</span>
                  <ul className="list-disc pl-5 text-sm space-y-1">
                    {(httpResult["4. Reglas de Rastreo"]?.RutasSensibles || []).map((item: string, idx: number) => (
                      <li key={idx}>
                        {badge(item, 'bg-red-200 text-red-800', 'Ruta sensible')}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold">CasosDeUso:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(httpResult["4. Reglas de Rastreo"]?.CasosDeUso || []).map((item: string, idx: number) => (
                      <span key={idx} className="mr-1">
                        {badge(item, 'bg-blue-100 text-blue-800', crawlRuleBadgeTooltip[item] || item)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* 5. Encabezados de Respuesta */}
            <div className="border-b pb-2">
              <h3 className="font-semibold mb-1">5. Encabezados de Respuesta</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {Object.entries(httpResult["5. Encabezados de Respuesta"] || {}).map(([key, value]) => (
                  key !== "Información" && (
                    <div key={key}>
                      <span className="font-semibold">{key}:</span> <span>{value || '-'}</span>
                    </div>
                  )
                ))}
              </div>
            </div>
            {/* 6. Redirecciones */}
            <div className="border-b pb-2">
              <h3 className="font-semibold mb-1">6. Redirecciones</h3>
              <div>
                <span className="font-semibold">CadenaRedirecciones:</span>
                {renderList(httpResult["6. Redirecciones"]?.CadenaRedirecciones || [])}
              </div>
              <div>
                <span className="font-semibold">URLFinal:</span>{" "}
                {httpResult["6. Redirecciones"]?.URLFinal || '-'}
              </div>
            </div>
            {/* 7. Errores */}
            <div>
              <h3 className="font-semibold mb-1">7. Errores</h3>
              <div>
                <span className="font-semibold">Errores:</span>
                {renderList(httpResult["7. Errores"]?.Errores || [])}
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