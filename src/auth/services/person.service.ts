import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, IsNull, Not, Repository } from 'typeorm';
import { getErrorMessage, getPgErrorCode } from '../../common/utils/error-message';
import { CreatePersonDto } from '../dto/create-person.dto';
import { UpdatePersonDto } from '../dto/update-person.dto';
import { Person } from '../entities/person.entity';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LogService } from '@/audit/services/log.service';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<Person[]> {
    try {
      return await this.personRepository.find({
        where: { deletedAt: IsNull() },
        order: { firstName: 'ASC', lastName: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener las personas. ${getErrorMessage(error)}`);
    }
  }

  async findAllTrashed(): Promise<Person[]> {
    try {
      return await this.personRepository.find({
        where: { deletedAt: Not(IsNull()) },
        order: { firstName: 'ASC', lastName: 'ASC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener las personas. ${getErrorMessage(error)}`);
    }
  }

  async findOne(id: number): Promise<Person> {
    try {
      return await this.personRepository.findOneOrFail({
        where: { idPerson: id, deletedAt: IsNull() },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe la persona con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar la persona. ${getErrorMessage(error)}`);
    }
  }

  async create(dto: CreatePersonDto, loggerAction: LoggerActionInterface): Promise<Person> {
    try {
      const person = this.personRepository.create(dto);
      const savedPerson = await this.personRepository.save(person);
      return savedPerson;
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (getPgErrorCode(error) === '23505') {
        const detail = String(
          typeof error === 'object' && error !== null && 'detail' in error
            ? (error as { detail?: unknown }).detail
            : '',
        );
        if (detail.includes('ci')) {
          throw new ConflictException(`El CI: "${dto.ci}" ya está en uso.`);
        }
        if (detail.includes('email')) {
          throw new ConflictException(`El Email: "${dto.email}" ya está en uso.`);
        }
      }
      throw new BadRequestException(`Error al crear la persona. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }

  async update(id: number, changes: UpdatePersonDto, loggerAction: LoggerActionInterface): Promise<Person> {
    try {
      const result = await this.findOne(id);
      this.personRepository.merge(result, changes);
      return await this.personRepository.save(result);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      throw new BadRequestException(`Error al actualizar la persona. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }

  async delete(id: number, loggerAction: LoggerActionInterface): Promise<boolean> {
    try {
      await this.findOne(id);
      await this.personRepository.softDelete({ idPerson: id });
      return true;
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      throw new BadRequestException(`Error al eliminar la persona. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }

  async restore(id: number, loggerAction: LoggerActionInterface) {
    try {
      const result = await this.personRepository.restore({ idPerson: id });
      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró una persona eliminada con ID ${id}`);
      }
      return { message: 'Registro restaurado exitosamente' };
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(`Error al restaurar la persona. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }
}
