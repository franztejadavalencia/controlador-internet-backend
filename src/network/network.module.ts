import { Module } from '@nestjs/common';
import { NetworkDetailsController } from './controllers/network-details.controller';
import { NetworkDetailsService } from './services/network-details.service';

@Module({
  controllers: [NetworkDetailsController],
  providers: [NetworkDetailsService]
})
export class NetworkModule {}
