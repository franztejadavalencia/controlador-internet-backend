import { Module } from '@nestjs/common';
import { NetworkDetailsController } from './controllers/network-details.controller';
import { NetworkDetailsService } from './services/network-details.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NetworkDetails } from './entities/network-details.entity';
import { Subscription } from '@/billing/entities/subscription.entity';
import { DeviceType } from './entities/device-type.entity';
import { DeviceTypeService } from './services/device-type.service';
import { DeviceTypeController } from './controllers/device-type.controller';

@Module({
  imports: [TypeOrmModule.forFeature([NetworkDetails, Subscription, DeviceType])],
  exports: [TypeOrmModule],
  controllers: [NetworkDetailsController, DeviceTypeController],
  providers: [NetworkDetailsService, DeviceTypeService],
})
export class NetworkModule {}
