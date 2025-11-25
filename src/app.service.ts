import { Injectable } from '@nestjs/common';

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  uptime: number;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  version?: string;
  details?: {
    database?: string;
    externalApi?: string;
    [key: string]: any;
  };
}

export interface SystemMemoryUsage {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
}

@Injectable()
export class AppService {
  private readonly startTime: number = Date.now();

  getHello(): string {
    return 'publicbot Sena v2.5.3';
  }

  getHealthDetailed(): HealthCheckResponse {
    const memoryUsage = process.memoryUsage();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memoryUsage: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024), // MB
      },
      version: process.env.npm_package_version,
      details: {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        cwd: process.cwd(),
      },
    };
  }

  getMetrics(): any {
    const memoryUsage = process.memoryUsage();
    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memoryUsage.rss,
        rss_mb: Math.round(memoryUsage.rss / 1024 / 1024),
        heapTotal: memoryUsage.heapTotal,
        heapTotal_mb: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        heapUsed: memoryUsage.heapUsed,
        heapUsed_mb: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        external: memoryUsage.external,
        external_mb: Math.round(memoryUsage.external / 1024 / 1024),
        arrayBuffers: memoryUsage.arrayBuffers,
        arrayBuffers_mb: Math.round(memoryUsage.arrayBuffers / 1024 / 1024),
      },
      cpu: {
        usage: process.cpuUsage(),
      },
      env: process.env.NODE_ENV,
    };
  }


  ping(): { message: string; timestamp: string } {
    return {
      message: 'ready',
      timestamp: new Date().toISOString(),
    };
  }


  getAppInfo(): { name: string; version: string; environment: string } {
    return {
      name: 'publicbot',
      version: process.env.npm_package_version,
      environment: process.env.NODE_ENV,
    };
  }
} 