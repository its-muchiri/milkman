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
import { OrdersModule } from './orders/orders.module';

const envCandidates = [
  path.resolve(__dirname, '../../../.env'),
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '../../.env'),
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: envCandidates }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    OrdersModule,
    AuditModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
