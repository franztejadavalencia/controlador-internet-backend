import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggerAction } from '@/common/decorators/logger-action.decorator';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { ChangePasswordUserDto } from '../dto/change-password-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../services/user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  getAll() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('trash')
  @ApiOperation({ summary: 'Listar usuarios eliminados' })
  getTrashed() {
    return this.userService.findAllTrashed();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.userService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  create(
    @Body() payload: CreateUserDto,
    @LoggerAction({ action: 'CREATE_USER' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.userService.create(payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un usuario' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateUserDto,
    @LoggerAction({ action: 'UPDATE_USER' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.userService.update(id, payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un usuario' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'DELETE_USER' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.userService.delete(id, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un usuario' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'RESTORE_USER' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.userService.restore(id, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/change-password')
  @ApiOperation({ summary: 'Cambiar contraseña de un usuario' })
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: ChangePasswordUserDto,
    @LoggerAction({ action: 'CHANGE_PASSWORD_USER' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.userService.changePassword(id, payload, loggerAction);
  }
}
