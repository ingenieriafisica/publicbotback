import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import * as promClient from 'prom-client';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  // Contador para las peticiones totales por IP
  private readonly httpRequestTotalByIp = new promClient.Counter({
    name: 'http_requests_total_by_ip',
    help: 'Número total de peticiones HTTP por dirección IP',
    labelNames: ['ip_address', 'method', 'route'],
  });

  // Contador para errores de la API
  private readonly apiErrorsTotal = new promClient.Counter({
    name: 'api_errors_total',
    help: 'Número total de errores de la API',
    labelNames: ['method', 'route', 'status_code', 'error_type', 'ip_address'],
  });

  use(req: any, res: any, next: () => void) {
    res.on('finish', () => {
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown'; // Obtener la IP
      const route = req.route ? req.route.path : 'unknown_route'; // Obtener la ruta

      // Incrementar el contador de peticiones por IP
      this.httpRequestTotalByIp.inc({
        ip_address: ipAddress,
        method: req.method,
        route: route,
      });

      // Si la petición resultó en un error (código de estado >= 400)
      if (res.statusCode >= 400) {
        let errorType = 'unknown_error';
        if (res.statusCode >= 500) {
          errorType = 'server_error';
        } else if (res.statusCode >= 400) {
          errorType = 'client_error';
        }

        // Incrementa el contador de errores con detalles
        this.apiErrorsTotal.inc({
          method: req.method,
          route: route,
          status_code: res.statusCode,
          error_type: errorType,
          ip_address: ipAddress,
        });
      }
    });

    next();
  }
}