import { Module } from '@nestjs/common';
import { DarajaController } from './daraja.controller';
import { DarajaService } from './daraja.service';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [PaymentsModule],
  controllers: [DarajaController],
  providers: [DarajaService],
  exports: [DarajaService],
})
export class DarajaModule {}
