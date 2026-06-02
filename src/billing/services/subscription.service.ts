import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityNotFoundError, IsNull, Not, Repository } from 'typeorm';
import { getErrorMessage } from '@/common/utils/error-message';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { Subscription } from '../entities/subscription.entity';
import { Plan } from '../entities/plan.entity';
import { Client } from '../entities/client.entity';
import { SubscriptionStatus } from '../entities/subscription-status.entity';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LogService } from '@/audit/services/log.service';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(SubscriptionStatus)
    private readonly subscriptionStatusRepository: Repository<SubscriptionStatus>,
    private readonly dataSource: DataSource,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<Subscription[]> {
    try {
      return await this.subscriptionRepository.find({
        where: { deletedAt: IsNull() },
        relations: {
          plan: true,
          client: {
            person: true,
          },
          subscriptionStatus: true,
        },
        order: { expirationDate: 'DESC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener las subscripciones. ${getErrorMessage(error)}`,
      );
    }
  }

  async findAllTrashed(): Promise<Subscription[]> {
    try {
      return await this.subscriptionRepository.find({
        where: { deletedAt: Not(IsNull()) },
        relations: {
          plan: true,
          client: true,
          subscriptionStatus: true,
        },
        order: { expirationDate: 'ASC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener subscripciones eliminadas. ${getErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: number): Promise<Subscription> {
    try {
      return await this.subscriptionRepository.findOneOrFail({
        where: { idSubscription: id, deletedAt: IsNull() },
        relations: {
          plan: true,
          client: true,
          subscriptionStatus: true,
        },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe la Subscripción con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar la subscripción. ${getErrorMessage(error)}`);
    }
  }

  async create(
    dto: CreateSubscriptionDto,
    loggerAction: LoggerActionInterface,
  ): Promise<Subscription> {
    try {
      const plan = await this.planRepository.findOne({
        where: { idPlan: dto.idPlan, deletedAt: IsNull() },
      });
      if (!plan) {
        throw new NotFoundException(`No existe el Plan con ID ${dto.idPlan}`);
      }
      const client = await this.clientRepository.findOne({
        where: { idClient: dto.idClient, deletedAt: IsNull() },
      });
      if (!client) {
        throw new NotFoundException(`No existe el cliente con ID ${dto.idClient}`);
      }
      const subscriptionStatus = await this.subscriptionStatusRepository.findOne({
        where: { idSubscriptionStatus: dto.idSubscriptionStatus, deletedAt: IsNull() },
      });
      if (!subscriptionStatus) {
        throw new NotFoundException(`No existe el estado de subscriptión con ID ${dto.idClient}`);
      }
      const query = await this.dataSource.query("SELECT nextval('subscription_code_seq') as next");
      const nextNumber = query[0].next;
      const code = `SUB${nextNumber.toString().padStart(4, '0')}`;
      const subscription = this.subscriptionRepository.create({
        code,
        expirationDate: dto.expirationDate ?? null,
        plan,
        client,
        subscriptionStatus,
      });
      return await this.subscriptionRepository.save(subscription);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear la subscripción. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async update(
    id: number,
    changes: UpdateSubscriptionDto,
    loggerAction: LoggerActionInterface,
  ): Promise<Subscription> {
    try {
      const result = await this.findOne(id);
      const plan = await this.planRepository.findOne({
        where: { idPlan: changes.idPlan, deletedAt: IsNull() },
      });
      if (!plan) {
        throw new NotFoundException(`No existe el Plan con ID ${changes.idPlan}`);
      }
      const client = await this.clientRepository.findOne({
        where: { idClient: changes.idClient, deletedAt: IsNull() },
      });
      if (!client) {
        throw new NotFoundException(`No existe el cliente con ID ${changes.idClient}`);
      }
      const subscriptionStatus = await this.subscriptionStatusRepository.findOne({
        where: { idSubscriptionStatus: changes.idSubscriptionStatus, deletedAt: IsNull() },
      });
      if (!subscriptionStatus) {
        throw new NotFoundException(`No existe el estado de subscriptión con ID ${changes.idClient}`);
      }
      this.subscriptionRepository.merge(result, changes);
      result.client = client;
      result.plan = plan;
      result.subscriptionStatus = subscriptionStatus;
      return await this.subscriptionRepository.save(result);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar la subscripción. ${getErrorMessage(error)}`,
      );
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async delete(id: number, loggerAction: LoggerActionInterface): Promise<boolean> {
    try {
      await this.findOne(id);
      await this.subscriptionRepository.softDelete({ idSubscription: id });
      return true;
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar la subscripción. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async restore(id: number, loggerAction: LoggerActionInterface) {
    try {
      const result = await this.subscriptionRepository.restore({
        deletedAt: Not(IsNull()),
        idSubscription: id,
      });
      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró la subscripción eliminada con ID ${id}`);
      }
      return { message: 'Registro restaurado exitosamente' };
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al restaurar la subscripción. ${getErrorMessage(error)}`,
      );
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }
}
