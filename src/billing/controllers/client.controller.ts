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
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { ClientService } from '../services/client.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('Client')
@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  getAll() {
    return this.clientService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('trash')
  @ApiOperation({ summary: 'Listar clientes eliminados' })
  getTrashed() {
    return this.clientService.findAllTrashed();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un cliente' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear un cliente' })
  create(
    @Body() payload: CreateClientDto,
    @LoggerAction({ action: 'CREATE_CLIENT' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.clientService.create(payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un cliente' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateClientDto,
    @LoggerAction({ action: 'UPDATE_CLIENT' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.clientService.update(id, payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un cliente' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'DELETE_CLIENT' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.clientService.delete(id, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un cliente' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'RESTORE_CLIENT' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.clientService.restore(id, loggerAction);
  }
}
