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
  import { ClientService } from '../services/client.service';
  import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
  import { SubscriptionStatusService } from '../services/subscription-status.service';

@Controller('subscription-status')
export class SubscriptionStatusController {
  constructor(private readonly subscriptionStatusService: SubscriptionStatusService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({ summary: 'Listar estados de subscripciones' })
  getAll() {
    return this.subscriptionStatusService.findAll();
  }
}
