import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, IsNull, Not, Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { getErrorMessage } from '../../common/utils/error-message';
import { CreateLogDto } from '../dto/create-log.dto';
import { UpdateLogDto } from '../dto/update-log.dto';
import { Log } from '../entities/log.entity';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Log[]> {
    try {
      return await this.logRepository.find({
        where: { deletedAt: IsNull() },
        relations: { user: { person: true } },
        order: { idLog: 'DESC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los logs. ${getErrorMessage(error)}`);
    }
  }

  async findAllTrashed(): Promise<Log[]> {
    try {
      return await this.logRepository.find({
        where: { deletedAt: Not(IsNull()) },
        relations: { user: { person: true } },
        order: { idLog: 'DESC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener los logs eliminados. ${getErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: number): Promise<Log> {
    try {
      return await this.logRepository.findOneOrFail({
        where: { idLog: id, deletedAt: IsNull() },
        relations: { user: { person: true } },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe el log con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar el log. ${getErrorMessage(error)}`);
    }
  }

  async create(dto: CreateLogDto): Promise<Log> {
    try {
      let user: User | null = null;

      if (dto.idUser > 0) {
        user = await this.userRepository.findOne({
          where: { idUser: dto.idUser, deletedAt: IsNull() },
        });
        if (!user) {
          throw new NotFoundException(`No existe el usuario con ID ${dto.idUser}`);
        }
      }

      const log = this.logRepository.create({
        ...(user ? { user } : {}),
        ip: dto.ip,
        action: dto.action,
        url: dto.url,
        method: dto.method,
        userAgent: dto.userAgent ?? null,
      });
      return await this.logRepository.save(log);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al crear el log. ${getErrorMessage(error)}`);
    }
  }

  async update(id: number, changes: UpdateLogDto): Promise<Log> {
    try {
      const result = await this.findOne(id);
      this.logRepository.merge(result, changes);
      return await this.logRepository.save(result);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al actualizar el log. ${getErrorMessage(error)}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.findOne(id);
      await this.logRepository.softDelete({ idLog: id });
      return true;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar el log. ${getErrorMessage(error)}`);
    }
  }

  async restore(id: number) {
    const result = await this.logRepository.restore({ idLog: id });
    if (result.affected === 0) {
      throw new NotFoundException(`No se encontró un log eliminado con ID ${id}`);
    }
    return { message: 'Registro restaurado exitosamente' };
  }
}
