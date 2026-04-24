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
import { CreateModuleDto } from '../dto/create-module.dto';
import { UpdateModuleDto } from '../dto/update-module.dto';
import { ModuleService } from '../services/module.service';

@ApiTags('AccessModule')
@Controller('access-module')
export class AccessModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Get()
  @ApiOperation({ summary: 'Listar módulos' })
  getAll() {
    return this.moduleService.findAll();
  }

  @Get('trash')
  @ApiOperation({ summary: 'Listar módulos eliminados' })
  getTrashed() {
    return this.moduleService.findAllTrashed();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un módulo' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.moduleService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un módulo' })
  create(
    @Body() payload: CreateModuleDto,
    @LoggerAction({ action: 'CREATE_MODULE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.moduleService.create(payload, loggerAction);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un módulo' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateModuleDto,
    @LoggerAction({ action: 'UPDATE_MODULE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.moduleService.update(id, payload, loggerAction);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un módulo' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'DELETE_MODULE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.moduleService.delete(id, loggerAction);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un módulo' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'RESTORE_MODULE' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.moduleService.restore(id, loggerAction);
  }
}
