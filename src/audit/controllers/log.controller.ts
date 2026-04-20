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
import { CreateLogDto } from '../dto/create-log.dto';
import { UpdateLogDto } from '../dto/update-log.dto';
import { LogService } from '../services/log.service';

@ApiTags('Log')
@Controller('log')
export class LogController {
  constructor(private readonly logService: LogService) {}

  @Get()
  @ApiOperation({ summary: 'Listar logs' })
  getAll() {
    return this.logService.findAll();
  }

  @Get('trash')
  @ApiOperation({ summary: 'Listar logs eliminados' })
  getTrashed() {
    return this.logService.findAllTrashed();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un log' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.logService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un log' })
  create(@Body() payload: CreateLogDto) {
    return this.logService.create(payload);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un log' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateLogDto,
  ) {
    return this.logService.update(id, payload);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un log' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.logService.delete(id);
  }

  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un log' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.logService.restore(id);
  }
}
