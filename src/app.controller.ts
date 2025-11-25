import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService, HealthCheckResponse } from './app.service';
import { JwtGuard } from './auth/jwt.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): HealthCheckResponse {
    return this.appService.getHealthDetailed();
  }

  @Get('usage')
  getMetrics(): any {
    return this.appService.getMetrics();
  }

  @Get('status')
  ping(): { message: string; timestamp: string } {
    return this.appService.ping();
  }

}