import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getErrorMessage } from '@/common/utils/error-message';
import { ClientType }from '../entities/client-type.entity';
import { IsNull, Repository } from 'typeorm';

@Injectable()
export class ClientTypeService {
  constructor(
    @InjectRepository(ClientType)
    private readonly clientTypeRepository: Repository<ClientType>,
  ) {}

  async findAll(): Promise<ClientType[]> {
    try {
      return await this.clientTypeRepository.find({
        where: { deletedAt: IsNull() },
        order: { name: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los tipos de clientes. ${getErrorMessage(error)}`);
    }
  }
}
