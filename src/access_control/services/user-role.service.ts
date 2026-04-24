import {
  BadRequestException,
  ConflictException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, IsNull, Not, Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { getErrorMessage, getPgErrorCode } from '../../common/utils/error-message';
import { CreateUserRoleDto } from '../dto/create-user-role.dto';
import { UpdateUserRoleDto } from '../dto/update-user-role.dto';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LogService } from '@/audit/services/log.service';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly logService: LogService,
  ) {}

  async findAll(): Promise<UserRole[]> {
    try {
      return await this.userRoleRepository.find({
        where: { deletedAt: IsNull() },
        relations: { user: { person: true }, role: true },
        order: { idUserRole: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener las asignaciones usuario-rol. ${getErrorMessage(error)}`,
      );
    }
  }

  async findAllTrashed(): Promise<UserRole[]> {
    try {
      return await this.userRoleRepository.find({
        where: { deletedAt: Not(IsNull()) },
        relations: { user: { person: true }, role: true },
        order: { idUserRole: 'ASC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener las asignaciones eliminadas. ${getErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: number): Promise<UserRole> {
    try {
      return await this.userRoleRepository.findOneOrFail({
        where: { idUserRole: id, deletedAt: IsNull() },
        relations: { user: { person: true }, role: true },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe la asignación usuario-rol con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar la asignación. ${getErrorMessage(error)}`);
    }
  }

  async create(dto: CreateUserRoleDto, loggerAction: LoggerActionInterface): Promise<UserRole> {
    try {
      const user = await this.userRepository.findOne({
        where: { idUser: dto.idUser, deletedAt: IsNull() },
      });
      const role = await this.roleRepository.findOne({
        where: { idRole: dto.idRole, deletedAt: IsNull() },
      });
      if (!user) {
        throw new NotFoundException(`No existe el usuario con ID ${dto.idUser}`);
      }
      if (!role) {
        throw new NotFoundException(`No existe el rol con ID ${dto.idRole}`);
      }
      const assignment = this.userRoleRepository.create({ user, role });
      return await this.userRoleRepository.save(assignment);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (getPgErrorCode(error) === '23505') {
        throw new ConflictException('Este usuario ya tiene asignado ese rol (registro activo).');
      }
      throw new BadRequestException(`Error al asignar el rol. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }

  async update(
    id: number,
    changes: UpdateUserRoleDto,
    loggerAction: LoggerActionInterface,
  ): Promise<UserRole> {
    try {
      const result = await this.findOne(id);
      if (changes.idUser !== undefined || changes.idRole !== undefined) {
        const idUser = changes.idUser ?? result.user.idUser;
        const idRole = changes.idRole ?? result.role.idRole;
        const user = await this.userRepository.findOne({
          where: { idUser, deletedAt: IsNull() },
        });
        const role = await this.roleRepository.findOne({
          where: { idRole, deletedAt: IsNull() },
        });
        if (!user) {
          throw new NotFoundException(`No existe el usuario con ID ${idUser}`);
        }
        if (!role) {
          throw new NotFoundException(`No existe el rol con ID ${idRole}`);
        }
        result.user = user;
        result.role = role;
      }
      return await this.userRoleRepository.save(result);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (getPgErrorCode(error) === '23505') {
        throw new ConflictException('Este usuario ya tiene asignado ese rol (registro activo).');
      }
      throw new BadRequestException(`Error al actualizar la asignación. ${getErrorMessage(error)}`);
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
      await this.userRoleRepository.softDelete({ idUserRole: id });
      return true;
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar la asignación. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }

  async restore(id: number, loggerAction: LoggerActionInterface) {
    try {
      const result = await this.userRoleRepository.restore({ idUserRole: id });
      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró una asignación eliminada con ID ${id}`);
      }
      return { message: 'Registro restaurado exitosamente' };
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(`Error al restaurar la asignación. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }
}
