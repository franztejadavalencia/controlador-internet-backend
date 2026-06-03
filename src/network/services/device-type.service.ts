import {
    BadRequestException,
    Injectable,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { getErrorMessage } from '@/common/utils/error-message';
  import { DeviceType }from '../entities/device-type.entity';
  import { IsNull, Repository } from 'typeorm';

@Injectable()
export class DeviceTypeService {
  constructor(
    @InjectRepository(DeviceType)
    private readonly deviceTypeRepository: Repository<DeviceType>,
  ) {}

  async findAll(): Promise<DeviceType[]> {
    try {
      return await this.deviceTypeRepository.find({
        where: { deletedAt: IsNull() },
        order: { name: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los tipos de dispositivos. ${getErrorMessage(error)}`);
    }
  }
}
