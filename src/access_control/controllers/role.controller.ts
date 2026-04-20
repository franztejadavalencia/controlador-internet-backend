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
  create(@Body() payload: CreateRoleDto) {
    return this.roleService.create(payload);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un rol' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateRoleDto,
  ) {
    return this.roleService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un rol' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.delete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un rol' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.roleService.restore(id);
  }
}
