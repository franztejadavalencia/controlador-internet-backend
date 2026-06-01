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
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { PaymentService } from '../services/payment.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar pagos' })
  getAll() {
    return this.paymentService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('trash')
  @ApiOperation({ summary: 'Listar pagos eliminados' })
  getTrashed() {
    return this.paymentService.findAllTrashed();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un pago' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear un pago' })
  create(
    @Body() payload: CreatePaymentDto,
    @LoggerAction({ action: 'CREATE_PAYMENT' })
    LoggerAction: LoggerActionInterface,
  ) {
    return this.paymentService.create(payload, LoggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un pago' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdatePaymentDto,
    @LoggerAction({ action: 'UPDATE_PAYMENT' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.paymentService.update(id, payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un pago' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'DELETE_PAYMENT' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.paymentService.delete(id, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  @ApiOperation({ summary: 'RESTORE_PAYMENT' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'RESTORE_PAYMENT' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.paymentService.restore(id, loggerAction);
  }
}
