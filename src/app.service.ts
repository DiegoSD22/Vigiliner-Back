import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  private startTime = new Date();

  /**
   * Retorna información de health check de la API
   */
  getHealth() {
    const uptime = Math.floor(
      (new Date().getTime() - this.startTime.getTime()) / 1000
    );

    return {
      status: 'up',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }
}
