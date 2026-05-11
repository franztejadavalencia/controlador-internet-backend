import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from '../../common/utils/password-hasher';
import { UserService } from './user.service';
import { getErrorMessage } from '@/common/utils/error-message';
import { LoginResponse } from '../interfaces/login-response.interface';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LoginDto } from '../dto/login.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto, loggerAction: LoggerActionInterface): Promise<LoginResponse> {
    try {
      const user = await this.userService.findToLogin(dto.username);
      if (!user) {
        throw new UnauthorizedException('Credenciales inválidas.');
      }
      if (user.status === BLOCKED) {
        throw new UnauthorizedException('Cuenta bloqueada. Contacte al administrador.');
      }
      if (!(await verifyPassword(dto.password, user.passwordHash))) {
        await this.userService.handleFailedLogin(user, loggerAction);
        if (user.loginAttempts + 1 >= 3) {
          throw new UnauthorizedException('Cuenta bloqueada por seguridad.');
        }
        throw new UnauthorizedException('Credenciales inválidas.');
      }
      if (user.loginAttempts > 0) {
        await this.userService.resetLoginAttempts(user.idUser, loggerAction);
      }
      return this.generateLoginResponse(user);
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) throw error;
      throw new BadRequestException(`Error en el Login. ${getErrorMessage(error)}`);
    }
  }

  private generateLoginResponse(user: User): LoginResponse {
    const payload = {
      sub: user.idUser,
      username: user.username,
      role: 'Administrador',
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id_user: user.idUser,
        username: user.username,
        role: 'Administrador',
      },
    };
  }
}
