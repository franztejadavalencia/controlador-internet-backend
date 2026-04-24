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
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { RoleService } from '../services/role.service';

@ApiTags('Role')
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: 'Listar roles' })
  getAll() {
    return this.roleService.findAll();
  }

  @Get('trash')
  @ApiOperation({ summary: 'Listar roles eliminados' })
  getTrashed() {
    return this.roleService.findAllTrashed();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un rol' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un rol' })
  create(
    @Body() payload: CreateRoleDto,
    @LoggerAction({ action: 'CREATE_ROLE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.roleService.create(payload, loggerAction);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateRoleDto,
    @LoggerAction({ action: 'UPDATE_ROLE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.roleService.update(id, payload, loggerAction);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'DELETE_ROLE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.roleService.delete(id, loggerAction);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un rol' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'RESTORE_ROLE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.roleService.restore(id, loggerAction);
  }
}
