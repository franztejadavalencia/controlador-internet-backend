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
import { DeviceTypeService } from '../services/device-type.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('DeviceTypes')
@Controller('device-types')
export class DeviceTypeController {
  constructor(private readonly deviceTypeService: DeviceTypeService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar tipos de dispositivos' })
  getAll() {
    return this.deviceTypeService.findAll();
  }
}
