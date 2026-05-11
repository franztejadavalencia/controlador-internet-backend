import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import type { JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { PassportModule } from '@nestjs/passport';
import { PersonController } from './controllers/person.controller';
import { UserController } from './controllers/user.controller';
import { Person } from './entities/person.entity';
import { User } from './entities/user.entity';
import { PersonService } from './services/person.service';
import { UserService } from './services/user.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Person, User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') ?? '8h') as NonNullable<
            SignOptions['expiresIn']
          >,
        },
      }),
    }),
  ],
  exports: [TypeOrmModule, AuthService],
  providers: [PersonService, UserService, AuthService, JwtStrategy],
  controllers: [PersonController, UserController, AuthController],
})
export class AuthModule {}
