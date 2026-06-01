import { Module } from '@nestjs/common';
import { NetworkDetailsController } from './controllers/network-details.controller';
import { NetworkDetailsService } from './services/network-details.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkDetails } from './entities/network-details.entity';
import { Subscription } from '@/billing/entities/subscription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NetworkDetails, Subscription])],
  exports: [TypeOrmModule],
  controllers: [NetworkDetailsController],
  providers: [NetworkDetailsService],
})
export class NetworkModule {}
