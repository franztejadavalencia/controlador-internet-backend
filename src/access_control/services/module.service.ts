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
import { CreateModuleDto } from '../dto/create-module.dto';
import { UpdateModuleDto } from '../dto/update-module.dto';
import { ModuleEntity } from '../entities/module.entity';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LogService } from '@/audit/services/log.service';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(ModuleEntity)
    private readonly moduleRepository: Repository<ModuleEntity>,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<ModuleEntity[]> {
    try {
      return await this.moduleRepository.find({
        where: { deletedAt: IsNull() },
        order: { name: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los módulos. ${getErrorMessage(error)}`);
    }
  }

  async findAllTrashed(): Promise<ModuleEntity[]> {
    try {
      return await this.moduleRepository.find({
        where: { deletedAt: Not(IsNull()) },
        order: { name: 'ASC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener los módulos eliminados. ${getErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: number): Promise<ModuleEntity> {
    try {
      return await this.moduleRepository.findOneOrFail({
        where: { idModule: id, deletedAt: IsNull() },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe el módulo con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar el módulo. ${getErrorMessage(error)}`);
    }
  }

  async create(dto: CreateModuleDto, loggerAction: LoggerActionInterface): Promise<ModuleEntity> {
    try {
      const entity = this.moduleRepository.create(dto);
      return await this.moduleRepository.save(entity);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (getPgErrorCode(error) === '23505') {
        throw new ConflictException(`El nombre "${dto.name}" ya está en uso.`);
      }
      throw new BadRequestException(`Error al crear el módulo. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }

  async update(
    id: number,
    changes: UpdateModuleDto,
    loggerAction: LoggerActionInterface,
  ): Promise<ModuleEntity> {
    try {
      const result = await this.findOne(id);
      this.moduleRepository.merge(result, changes);
      return await this.moduleRepository.save(result);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (getPgErrorCode(error) === '23505' && changes.name) {
        throw new ConflictException(`El nombre "${changes.name}" ya está en uso.`);
      }
      throw new BadRequestException(`Error al actualizar el módulo. ${getErrorMessage(error)}`);
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
      await this.moduleRepository.softDelete({ idModule: id });
      return true;
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar el módulo. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }

  async restore(id: number, loggerAction: LoggerActionInterface) {
    try {
      const result = await this.moduleRepository.restore({ idModule: id });
      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró un módulo eliminado con ID ${id}`);
      }
      return { message: 'Registro restaurado exitosamente' };
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(`Error al restaurar el módulo. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }
}
