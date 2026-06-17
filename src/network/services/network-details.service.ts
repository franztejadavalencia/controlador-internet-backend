import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, IsNull, Not, Repository } from 'typeorm';
import { getErrorMessage } from '@/common/utils/error-message';
import { CreateNetworkDetailsDto } from '../dto/create-network-details.dto';
import { UpdateNetworkDetailsDto } from '../dto/update-network-details.dto';
import { NetworkDetails } from '../entities/network-details.entity';
import { Subscription } from '@/billing/entities/subscription.entity';
import { DeviceType } from '../entities/device-type.entity';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LogService } from '@/audit/services/log.service';
import { NetworkEngineService } from './network-engine.service';

@Injectable()
export class NetworkDetailsService {
  constructor(
    @InjectRepository(NetworkDetails)
    private readonly networkDetailsRepository: Repository<NetworkDetails>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(DeviceType)
    private readonly deviceTypeRepository: Repository<DeviceType>,
    private readonly networkEngineService: NetworkEngineService,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<NetworkDetails[]> {
    try {
      return await this.networkDetailsRepository.find({
        where: { deletedAt: IsNull() },
        relations: {
          subscription: {
            plan: true,
            client: {
              person: true,
            },
          },
          deviceType: true,
        },
        order: { ipAddress: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener los detalles de red. ${getErrorMessage(error)}`,
      );
    }
  }

  async findAllTrashed(): Promise<NetworkDetails[]> {
    try {
      return await this.networkDetailsRepository.find({
        where: { deletedAt: Not(IsNull()) },
        relations: {
          subscription: true,
          deviceType: true,
        },
        order: { ipAddress: 'ASC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener los detalles de red eliminados. ${getErrorMessage(error)}`,
      );
    }
  }

  async findAllSubscriptionActive(): Promise<NetworkDetails[]> {
    try {
      return await this.networkDetailsRepository.find({
        where: {
          deletedAt: IsNull(),
          subscription: {
            subscriptionStatus: {
              idSubscriptionStatus: 1,
            }
          },
        },
        relations: {
          subscription: {
            plan: true,
          },
          deviceType: true,
        },
        order: { ipAddress: 'ASC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener los dispositivos con subscripción activa. ${getErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: number): Promise<NetworkDetails> {
    try {
      return await this.networkDetailsRepository.findOneOrFail({
        where: { idNetworkDetail: id, deletedAt: IsNull() },
        relations: { subscription: true },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe el detalle de red con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar el detalle de red. ${getErrorMessage(error)}`);
    }
  }

  async create(
    dto: CreateNetworkDetailsDto,
    loggerAction: LoggerActionInterface,
  ): Promise<NetworkDetails> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { idSubscription: dto.idSubscription, deletedAt: IsNull() },
      });
      if (!subscription) {
        throw new NotFoundException(`No existe la subscripción con ID ${dto.idSubscription}`);
      }
      const deviceType = await this.deviceTypeRepository.findOne({
        where: { idDeviceType: dto.idDeviceType, deletedAt: IsNull() },
      });
      if (!deviceType) {
        throw new NotFoundException(`No existe el tipo de dispositivo con ID ${dto.idDeviceType}`);
      }
      const payment = this.networkDetailsRepository.create({
        ...dto,
        deviceType,
        subscription,
      });
      return await this.networkDetailsRepository.save(payment);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear el detalle de red. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async update(
    id: number,
    changes: UpdateNetworkDetailsDto,
    loggerAction: LoggerActionInterface,
  ): Promise<NetworkDetails> {
    try {
      const result = await this.findOne(id);
      const subscription = await this.subscriptionRepository.findOne({
        where: { idSubscription: changes.idSubscription, deletedAt: IsNull() },
      });
      if (!subscription) {
        throw new NotFoundException(`No existe la subscripción con ID ${changes.idSubscription}`);
      }
      const deviceType = await this.deviceTypeRepository.findOne({
        where: { idDeviceType: changes.idDeviceType, deletedAt: IsNull() },
      });
      if (!deviceType) {
        throw new NotFoundException(
          `No existe el tipo de dispositivo con ID ${changes.idDeviceType}`,
        );
      }
      result.subscription = subscription;
      result.deviceType = deviceType;
      this.networkDetailsRepository.merge(result, changes);
      return await this.networkDetailsRepository.save(result);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al actualizar el detalle de red. ${getErrorMessage(error)}`,
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
      await this.syncDeleteDevice(id);
      await this.networkDetailsRepository.softDelete({ idNetworkDetail: id });
      return true;
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Error al eliminar el detalle de red. ${getErrorMessage(error)}`,
      );
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async restore(id: number, loggerAction: LoggerActionInterface) {
    try {
      const result = await this.networkDetailsRepository.restore({
        deletedAt: Not(IsNull()),
        idNetworkDetail: id,
      });
      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró un detalle de red eliminado con ID ${id}`);
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

  async syncSubscription(idSubscription: number, action: 'HABILITAR' | 'DESHABILITAR') {
    const devices = await this.networkDetailsRepository.find({
      where: { subscription: { idSubscription } },
      relations: {
        subscription: {
          plan: true,
        }
      },
    });
    for (const device of devices) {
      const plan = device.subscription.plan;
      if (device.ipAddress && device.macAddress && plan) {
        await this.networkEngineService.syncDevice({
          ipAddress: device.ipAddress,
          macAddress: device.macAddress,
          downloadSpeed: action === 'HABILITAR' ? plan.downloadSpeed : 0,
          uploadSpeed: action === 'HABILITAR' ? plan.uploadSpeed : 0,
          action,
        });
      }
    }
  }

  async syncUpdatedSpeedPlan(idPlan: number) {
    const devices = await this.networkDetailsRepository.find({
      where: {
        subscription: {
          plan: { idPlan },
          subscriptionStatus: { idSubscriptionStatus: 1 },
        },
      },
      relations: { 
        subscription: {
          plan: true,
          subscriptionStatus: true,
        }
      },
    });

    for (const device of devices) {
      const plan = device.subscription.plan;
      if (device.ipAddress && device.macAddress) {
        await this.networkEngineService.syncDevice({
          ipAddress: device.ipAddress,
          macAddress: device.macAddress,
          downloadSpeed: plan.downloadSpeed,
          uploadSpeed: plan.uploadSpeed,
          action: 'HABILITAR',
        });
      }
    }
  }

  async syncDeleteDevice(idNetworkDetail: number) {
    const device = await this.networkDetailsRepository.findOne({
      where: { idNetworkDetail },
    });
    if (device && device.ipAddress && device.macAddress) {
      await this.networkEngineService.syncDevice({
        ipAddress: device.ipAddress,
        macAddress: device.macAddress,
        downloadSpeed: 0,
        uploadSpeed: 0,
        action: 'DESHABILITAR',
      });
    }
  }
}
