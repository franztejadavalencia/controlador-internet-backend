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
import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { PlanService } from '../services/plan.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@ApiTags('Plan')
@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar planes' })
  getAll() {
    return this.planService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('trash')
  @ApiOperation({ summary: 'Listar planes eliminados' })
  getAllTrashed() {
    return this.planService.findAllTrashed();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un plan' })
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.planService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Crear un plan' })
  create(
    @Body() payload: CreatePlanDto,
    @LoggerAction({ action: 'CREATE_PLAN' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.planService.create(payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un plan' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdatePlanDto,
    @LoggerAction({ action: 'UPDATE_PLAN' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.planService.update(id, payload, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un plan' })
  delete(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'DELETE_PLAN' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.planService.delete(id, loggerAction);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/restore')
  @ApiOperation({ summary: 'Restaurar un plan' })
  restore(
    @Param('id', ParseIntPipe) id: number,
    @LoggerAction({ action: 'RESTORE_PLAN' })
    loggerAction: LoggerActionInterface,
  ) {
    return this.planService.restore(id, loggerAction);
  }
}
