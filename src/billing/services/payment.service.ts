import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, IsNull, Not, Repository } from 'typeorm';
import { getErrorMessage } from '@/common/utils/error-message';
import { CreatePaymentDto } from '../dto/create-payment.dto';
import { UpdatePaymentDto } from '../dto/update-payment.dto';
import { Payment } from '../entities/payment.entity';
import { Subscription } from '../entities/subscription.entity';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LogService } from '@/audit/services/log.service';
import { SubscriptionStatus } from '../entities/subscription-status.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(SubscriptionStatus)
    private readonly subscriptionStatusRepository: Repository<SubscriptionStatus>,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<Payment[]> {
    try {
      return await this.paymentRepository.find({
        where: { deletedAt: IsNull() },
        relations: { subscription: true },
        order: { paymentDate: 'DESC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los pagos. ${getErrorMessage(error)}`);
    }
  }

  async findAllTrashed(): Promise<Payment[]> {
    try {
      return await this.paymentRepository.find({
        where: { deletedAt: Not(IsNull()) },
        relations: { subscription: true },
        order: { paymentDate: 'DESC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener los pagos eliminados. ${getErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: number): Promise<Payment> {
    try {
      return await this.paymentRepository.findOneOrFail({
        where: { idPayment: id, deletedAt: IsNull() },
        relations: { subscription: true },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe el pago con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar el pago. ${getErrorMessage(error)}`);
    }
  }

  async create(dto: CreatePaymentDto, loggerAction: LoggerActionInterface): Promise<Payment> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { idSubscription: dto.idSubscription, deletedAt: IsNull() },
      });
      if (!subscription) {
        throw new NotFoundException(`No existe la subscripción con ID ${dto.idSubscription}`);
      }
      const subscriptionStatus = await this.subscriptionStatusRepository.findOne({
        where: { idSubscriptionStatus: 1, deletedAt: IsNull() },
      });
      if (!subscriptionStatus) {
        throw new NotFoundException(`No existe el estado de subscriptión con ID 1`);
      }

      const now = new Date();
      const currentExpiration = subscription.expirationDate ? new Date(subscription.expirationDate) : null;

      const newExpirationDate = this.calculateNewExpirationDate(currentExpiration, now, dto.montsPayed);

      subscription.subscriptionStatus = subscriptionStatus;
      subscription.expirationDate = newExpirationDate;
      const updatedSubscription: Subscription = await this.subscriptionRepository.save(subscription);

      const payment = this.paymentRepository.create({
        ...dto,
        subscription: updatedSubscription,
      });
      return await this.paymentRepository.save(payment);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear el pago. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async update(
    id: number,
    changes: UpdatePaymentDto,
    loggerAction: LoggerActionInterface,
  ): Promise<Payment> {
    try {
      const result = await this.findOne(id);
      this.paymentRepository.merge(result, changes);
      return await this.paymentRepository.save(result);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al actualizar el pago. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async delete(id: number, loggerAction: LoggerActionInterface): Promise<boolean> {
    try {
      await this.findOne(id);
      await this.paymentRepository.softDelete({ idPayment: id });
      return true;
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar el pago. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async restore(id: number, loggerAction: LoggerActionInterface) {
    try {
      const result = await this.paymentRepository.restore({
        deletedAt: Not(IsNull()),
        idPayment: id,
      });
      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró un pago eliminado con ID ${id}`);
      }
      return { message: 'Registro restaurado exitosamente' };
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(`Error al restaurar el pago. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  private calculateNewExpirationDate(currentExpiration: Date | null, now: Date, monthsPayed: number): Date {
    const baseDate = new Date(now);

    if (!currentExpiration) {
      baseDate.setMonth(baseDate.getMonth() + monthsPayed);
      return baseDate;
    }

    if (currentExpiration.getTime() < now.getTime()) {
      baseDate.setMonth(baseDate.getMonth() + monthsPayed);
      return baseDate;
    }

    const extendedDate = new Date(currentExpiration);
    extendedDate.setMonth(extendedDate.getMonth() + monthsPayed);
    return extendedDate;
  }

  private determineNewStatusId(currentExpiration: Date | null, now: Date): number {
    const STATUS_ACTIVO = 1;
    if (!currentExpiration || currentExpiration.getTime() < now.getTime()) {
      return STATUS_ACTIVO;
    }
    return STATUS_ACTIVO;
  }
}
