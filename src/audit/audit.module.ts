import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { LogController } from './controllers/log.controller';
import { Log } from './entities/log.entity';
import { LogService } from './services/log.service';

@Module({
  imports: [TypeOrmModule.forFeature([Log, User])],
  exports: [TypeOrmModule],
  providers: [LogService],
  controllers: [LogController],
})
export class AuditModule {}
