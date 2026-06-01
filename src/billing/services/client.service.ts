import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, IsNull, Not, Repository } from 'typeorm';
import { getErrorMessage, getPgErrorCode } from '@/common/utils/error-message';
import { CreateClientDto } from '../dto/create-client.dto';
import { UpdateClientDto } from '../dto/update-client.dto';
import { Client } from '../entities/client.entity';
import { Person } from '@/auth/entities/person.entity';
import { ClientType }from '../entities/client-type.entity';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LogService } from '@/audit/services/log.service';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    @InjectRepository(ClientType)
    private readonly clientTypeRepository: Repository<ClientType>,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<Client[]> {
    try {
      return await this.clientRepository.find({
        where: { deletedAt: IsNull() },
        relations: { person: true, clientType: true },
        order: {
          person: {
            firstName: 'ASC',
            lastName: 'ASC',
          },
        },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los clientes. ${getErrorMessage(error)}`);
    }
  }

  async findAllTrashed(): Promise<Client[]> {
    try {
      return await this.clientRepository.find({
        where: { deletedAt: Not(IsNull()) },
        relations: { person: true, clientType: true },
        order: {
          person: {
            firstName: 'ASC',
            lastName: 'ASC',
          },
        },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener los clientes eliminados. ${getErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: number): Promise<Client> {
    try {
      return await this.clientRepository.findOneOrFail({
        where: { idClient: id, deletedAt: IsNull() },
        relations: { person: true, clientType: true },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe el cliente con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar el cliente. ${getErrorMessage(error)}`);
    }
  }

  async create(dto: CreateClientDto, loggerAction: LoggerActionInterface): Promise<Client> {
    try {
      const person = await this.personRepository.findOne({
        where: { idPerson: dto.idPerson, deletedAt: IsNull() },
      });
      if (!person) {
        throw new NotFoundException(`No existe la persona con ID ${dto.idPerson}`);
      }
      const clientType = await this.clientTypeRepository.findOne({
        where: { idClientType: dto.idClientType, deletedAt: IsNull() },
      });
      if (!clientType) {
        throw new NotFoundException(`No existe el tipo de cliente con ID ${dto.idPerson}`);
      }
      const client = this.clientRepository.create({
        clientType,
        person,
      });
      return await this.clientRepository.save(client);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (getPgErrorCode(error) === '23505') {
        const detail = String(
          typeof error === 'object' && error !== null && 'detail' in error
            ? (error as { detail?: unknown }).detail
            : '',
        );
        if (detail.includes('id_person')) {
          throw new ConflictException(`La persona que seleccionó, ya es cliente.`);
        }
      }
      throw new BadRequestException(`Error al crear el cliente. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async update(
    id: number,
    changes: UpdateClientDto,
    loggerAction: LoggerActionInterface,
  ): Promise<Client> {
    try {
      const result = await this.findOne(id);
      const person = await this.personRepository.findOne({
        where: { idPerson: changes.idPerson, deletedAt: IsNull() },
      });
      if (!person) {
        throw new NotFoundException(`No existe la persona con ID ${changes.idPerson}`);
      }
      const clientType = await this.clientTypeRepository.findOne({
        where: { idClientType: changes.idClientType, deletedAt: IsNull() },
      });
      if (!clientType) {
        throw new NotFoundException(`No existe el tipo de cliente con ID ${changes.idPerson}`);
      }
      result.person = person;
      result.clientType = clientType;
      return await this.clientRepository.save(result);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (getPgErrorCode(error) === '23505') {
        const detail = String(
          typeof error === 'object' && error !== null && 'detail' in error
            ? (error as { detail?: unknown }).detail
            : '',
        );
        if (detail.includes('id_person')) {
          throw new ConflictException(`La persona que seleccionó, ya es cliente.`);
        }
      }
      throw new BadRequestException(`Error al actualizar el cliente. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async delete(id: number, loggerAction: LoggerActionInterface): Promise<boolean> {
    try {
      await this.findOne(id);
      await this.clientRepository.softDelete({ idClient: id });
      return true;
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar el cliente. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async restore(id: number, loggerAction: LoggerActionInterface) {
    try {
      const result = await this.clientRepository.restore({
        deletedAt: Not(IsNull()),
        idClient: id,
      });
      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró un cliente eliminado con ID ${id}`);
      }
      return { message: 'Registro restaurado exitosamente' };
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(`Error al restaurar el cliente. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }
}
