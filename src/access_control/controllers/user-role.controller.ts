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
  create(@Body() payload: CreateUserRoleDto) {
    return this.userRoleService.create(payload);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar una asignación (usuario y/o rol)' })
  update(@Param('id', ParseIntPipe) id: number, @Body() payload: UpdateUserRoleDto) {
    return this.userRoleService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una asignación (soft delete)' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.userRoleService.delete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar una asignación eliminada' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.userRoleService.restore(id);
  }
}
