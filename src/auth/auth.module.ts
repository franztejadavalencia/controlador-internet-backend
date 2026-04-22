import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonController } from './controllers/person.controller';
import { UserController } from './controllers/user.controller';
import { Person } from './entities/person.entity';
import { User } from './entities/user.entity';
import { PersonService } from './services/person.service';
import { UserService } from './services/user.service';

@Module({
  imports: [TypeOrmModule.forFeature([Person, User])],
  exports: [TypeOrmModule],
  providers: [PersonService, UserService],
  controllers: [PersonController, UserController],
})
export class AuthModule {}
