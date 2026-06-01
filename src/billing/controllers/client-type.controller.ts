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
import { ClientTypeService } from '../services/client-type.service';

@Controller('client-type')
export class ClientTypeController {
  constructor(private readonly clientTypeService: ClientTypeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar tipos de clientes' })
  getAll() {
    return this.clientTypeService.findAll();
  }
}
