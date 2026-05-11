import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { LoginResponse } from '../interfaces/login-response.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { UserActiveInterface } from '../interfaces/user-active.interface';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LoggerAction } from '@/common/decorators/logger-action.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Ingresar al sistema' })
  async login(
    @LoggerAction({ action: 'LOGIN_USER' })
    loggerAction: LoggerActionInterface,
    @Body() dto: LoginDto,
  ): Promise<LoginResponse> {
    return await this.authService.login(dto, loggerAction);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  obtenerPerfil(@Request() req: LoginResponse): UserActiveInterface {
    return req.user;
  }
}
