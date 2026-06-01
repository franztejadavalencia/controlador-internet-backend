import {
    BadRequestException,
    Injectable,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { getErrorMessage } from '@/common/utils/error-message';
  import { SubscriptionStatus }from '../entities/subscription-status.entity';
  import { IsNull, Repository } from 'typeorm';

@Injectable()
export class SubscriptionStatusService {
  constructor(
    @InjectRepository(SubscriptionStatus)
    private readonly subscriptionStatusRepository: Repository<SubscriptionStatus>,
  ) {}

  async findAll(): Promise<SubscriptionStatus[]> {
    try {
      return await this.subscriptionStatusRepository.find({
        where: { deletedAt: IsNull() },
        order: { name: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los estados de subscripciones. ${getErrorMessage(error)}`);
    }
  }
}
