import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../auth/auth.decorators';

/**
 * Liveness + DB/PostGIS reachability. Public so load balancers and the
 * rider offline-sync can probe it without a token.
 */
@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async check() {
    try {
      const rows = await this.dataSource.query(
        `SELECT current_setting('server_version') AS pg_version, postgis_version() AS postgis`,
      );
      return {
        status: 'ok',
        database: { connected: true, ...rows[0] },
        timezone: 'Africa/Nairobi',
        time: new Date().toISOString(),
      };
    } catch (err) {
      throw new ServiceUnavailableException(
        `Database unreachable: ${(err as Error).message}`,
      );
    }
  }
}
