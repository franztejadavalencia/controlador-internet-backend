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
import { CreateNetworkDetailsDto } from '../dto/create-network-details.dto';
import { UpdateNetworkDetailsDto } from '../dto/update-network-details.dto';
import { NetworkDetailsService } from '../services/network-details.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('NetworkDetails')
@Controller('network-details')
export class NetworkDetailsController {
  constructor(private readonly networkDetailsService: NetworkDetailsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar detalles de red' })
  getAll() {
    return this.networkDetailsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('trash')
  @ApiOperation({ summary: 'Listar detalles de red eliminados' })
  getTrashed() {
    return this.networkDetailsService.findAllTrashed();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un detalle de red' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.networkDetailsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear un detalle de red' })
  create(
    @Body() payload: CreateNetworkDetailsDto,
    @LoggerAction({ action: 'CREATE_NETWORK_DETAILS' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.networkDetailsService.create(payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un detalle de red' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateNetworkDetailsDto,
    @LoggerAction({ action: 'UPDATE_NETWORK_DETAILS' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.networkDetailsService.update(id, payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un detalle de red' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'DELETE_NETWORK_DETAILS' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.networkDetailsService.delete(id, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un detalle de red' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'RESTORE_NETWORK_DETAILS' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.networkDetailsService.restore(id, loggerAction);
  }
}
