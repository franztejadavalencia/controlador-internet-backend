import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verifyPassword } from '../../common/utils/password-hasher';
import { UserService } from './user.service';
import { getErrorMessage } from '@/common/utils/error-message';
import { LoginResponse, LoginStatus } from '../interfaces/login-response.interface';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LoginDto } from '../dto/login.dto';
import { User } from '../entities/user.entity';
import { authenticator } from '@otplib/preset-default';
import { MfaActivateDto } from '../dto/mfa-activate.dto';
import { MfaVerifyDto } from '../dto/mfa-verify.dto';
import { LogService } from '@/audit/services/log.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private readonly logService: LogService,
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
      if (user.isTwoFactorEnabled && !user.twoFactorSecret) {
        return await this.generateMfaSetup(user);
      }
      if (user.isTwoFactorEnabled && user.twoFactorSecret) {
        return {
          status: LoginStatus.VERIFY_TOKEN,
          idUser: user.idUser,
        };
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
      status: LoginStatus.SUCCESS,
      access_token: this.jwtService.sign(payload),
      user: {
        id_user: user.idUser,
        username: user.username,
        role: 'Administrador',
      },
    };
  }

  private async generateMfaSetup(user: User): Promise<LoginResponse> {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(
      user.username,
      'SIS704',
      secret,
    );
    return {
      status: LoginStatus.PENDING_SYNC,
      requiresMfaSetup: true,
      mfaData: {
        secret,
        otpauthUrl,
      },
      idUser: user.idUser
    };
  }

  async activateMfa(data: MfaActivateDto, loggerAction: LoggerActionInterface): Promise<LoginResponse> {
    const { idUser, token, secret } = data;
    const isValid = authenticator.verify({ token, secret });

    if (!isValid) {
      throw new UnauthorizedException('Código de verificación inválido.');
    }

    await this.userService.update(idUser, { 
      twoFactorSecret: secret,
    }, loggerAction);

    const user = await this.userService.findOne(idUser);
    return this.generateLoginResponse(user);
  }

  async verifyMfa(dto: MfaVerifyDto, loggerAction: LoggerActionInterface): Promise<LoginResponse> {
    const user = await this.userService.findOne(dto.idUser);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('El usuario no tiene 2FA configurado.');
    }
  
    const isValid = authenticator.verify({
      token: dto.token,
      secret: user.twoFactorSecret,
    });
  
    if (!isValid) {
      throw new UnauthorizedException('Código de verificación incorrecto.');
    }

    await this.logService.create({
      ...loggerAction,
    });
  
    return this.generateLoginResponse(user);
  }
}
