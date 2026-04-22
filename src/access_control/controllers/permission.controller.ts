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
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { PermissionService } from '../services/permission.service';

@ApiTags('Permission')
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ApiOperation({ summary: 'Listar permisos' })
  getAll() {
    return this.permissionService.findAll();
  }

  @Get('trash')
  @ApiOperation({ summary: 'Listar permisos eliminados' })
  getTrashed() {
    return this.permissionService.findAllTrashed();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un permiso' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un permiso' })
  create(@Body() payload: CreatePermissionDto) {
    return this.permissionService.create(payload);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un permiso' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdatePermissionDto,
  ) {
    return this.permissionService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un permiso' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.delete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un permiso' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.permissionService.restore(id);
  }
}
