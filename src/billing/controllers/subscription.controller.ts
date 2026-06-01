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
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { SubscriptionService } from '../services/subscription.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('Subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar subscripciones' })
  getAll() {
    return this.subscriptionService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('trash')
  @ApiOperation({ summary: 'Listar subscripciones eliminadas' })
  getAllTrashed() {
    return this.subscriptionService.findAllTrashed();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener una subscripcion' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear una subscripcion' })
  create(
    @Body() payload: CreateSubscriptionDto,
    @LoggerAction({ action: 'CREATE_PLAN' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.subscriptionService.create(payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un plan' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateSubscriptionDto,
    @LoggerAction({ action: 'UPDATE_SUBSCRIPTION' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.subscriptionService.update(id, payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una subscripcion' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'DELETE_PLAN' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.subscriptionService.delete(id, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar una subscripcion' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'RESTORE_SUBSCRIPTION' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.subscriptionService.restore(id, loggerAction);
  }
}
