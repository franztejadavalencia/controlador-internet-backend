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
import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { Plan } from '../entities/plan.entity';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LogService } from '@/audit/services/log.service';

@Injectable()
export class PlanService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<Plan[]> {
    try {
      return await this.planRepository.find({
        where: { deletedAt: IsNull() },
        order: { name: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los planes. ${getErrorMessage(error)}`);
    }
  }

  async findAllTrashed(): Promise<Plan[]> {
    try {
      return await this.planRepository.find({
        where: { deletedAt: Not(IsNull()) },
        order: { name: 'ASC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los planes. ${getErrorMessage(error)}`);
    }
  }

  async findOne(id: number): Promise<Plan> {
    try {
      return await this.planRepository.findOneOrFail({
        where: { idPlan: id, deletedAt: IsNull() },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe el plan con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar el plan. ${getErrorMessage(error)}`);
    }
  }

  async create(dto: CreatePlanDto, loggerAction: LoggerActionInterface): Promise<Plan> {
    try {
      const plan = this.planRepository.create(dto);
      return await this.planRepository.save(plan);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (getPgErrorCode(error) === '23505') {
        const detail = String(
          typeof error === 'object' && error !== null && 'detail' in error
            ? (error as { detail?: unknown }).detail
            : '',
        );
        if (detail.includes('name')) {
          throw new ConflictException(`El nombre: "${dto.name}" ya está en uso.`);
        }
      }
      throw new BadRequestException(`Error al crear el plan. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async update(
    id: number,
    changes: UpdatePlanDto,
    loggerAction: LoggerActionInterface,
  ): Promise<Plan> {
    try {
      const result = await this.findOne(id);
      this.planRepository.merge(result, changes);
      return await this.planRepository.save(result);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (getPgErrorCode(error) === '23505') {
        const detail = String(
          typeof error === 'object' && error !== null && 'detail' in error
            ? (error as { detail?: unknown }).detail
            : '',
        );
        if (detail.includes('name')) {
          throw new ConflictException(`El nombre: "${changes.name}" ya está en uso.`);
        }
      }
      throw new BadRequestException(`Error al actualizar el plan. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async delete(id: number, loggerAction: LoggerActionInterface): Promise<boolean> {
    try {
      await this.findOne(id);
      await this.planRepository.softDelete({ idPlan: id });
      return true;
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      throw new BadRequestException(`Error al eliminar el plan. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        ...loggerAction,
      });
    }
  }

  async restore(id: number, loggerAction: LoggerActionInterface) {
    try {
      const result = await this.planRepository.restore({
        deletedAt: Not(IsNull()),
        idPlan: id,
      });
      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró un plan eliminada con ID ${id}`);
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
        ...loggerAction,
      });
    }
  }
}
