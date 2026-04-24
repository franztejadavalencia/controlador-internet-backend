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
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoggerAction } from '@/common/decorators/logger-action.decorator';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { CreateUserRoleDto } from '../dto/create-user-role.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { UserRoleService } from '../services/user-role.service';

@ApiTags('UserRole')
@Controller('user-role')
export class UserRoleController {
  constructor(private readonly userRoleService: UserRoleService) {}

  @Get()
  @ApiOperation({ summary: 'Listar asignaciones usuario-rol' })
  getAll() {
    return this.userRoleService.findAll();
  }

  @Get('trash')
  @ApiOperation({ summary: 'Listar asignaciones eliminadas' })
  getTrashed() {
    return this.userRoleService.findAllTrashed();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación por id_user_role' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.userRoleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Asignar un rol a un usuario' })
  create(
    @Body() payload: CreateUserRoleDto,
    @LoggerAction({ action: 'CREATE_USER_ROLE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.userRoleService.create(payload, loggerAction);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una asignación (usuario y/o rol)' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateUserRoleDto,
    @LoggerAction({ action: 'UPDATE_USER_ROLE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.userRoleService.update(id, payload, loggerAction);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una asignación (soft delete)' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'DELETE_USER_ROLE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.userRoleService.delete(id, loggerAction);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar una asignación eliminada' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'RESTORE_USER_ROLE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.userRoleService.restore(id, loggerAction);
  }
}
