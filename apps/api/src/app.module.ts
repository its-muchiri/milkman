import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import * as path from 'path';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard, RolesGuard } from './auth/auth.guards';
import { UsersModule } from './users/users.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';

const envCandidates = [
  path.resolve(__dirname, '../../../.env'), // built: dist/ -> apps/api -> apps -> root
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: envCandidates }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    AuditModule,
    HealthModule,
  ],
  providers: [
    // Every endpoint requires a valid JWT unless explicitly @Public()…
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // …and role/sub-permission checks run on top (@Roles, @RequirePermission).
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
