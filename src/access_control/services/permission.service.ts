import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, IsNull, Not, Repository } from 'typeorm';
import { getErrorMessage, getPgErrorCode } from '../../common/utils/error-message';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { ModuleEntity } from '../entities/module.entity';
import { Permission } from '../entities/permission.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(ModuleEntity)
    private readonly moduleRepository: Repository<ModuleEntity>,
  ) {}

  async findAll(): Promise<Permission[]> {
    try {
      return await this.permissionRepository.find({
        where: { deletedAt: IsNull() },
        relations: { role: true, module: true },
        order: { idPermission: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los permisos. ${getErrorMessage(error)}`);
    }
  }

  async findAllTrashed(): Promise<Permission[]> {
    try {
      return await this.permissionRepository.find({
        where: { deletedAt: Not(IsNull()) },
        relations: { role: true, module: true },
        order: { idPermission: 'ASC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener los permisos eliminados. ${getErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: number): Promise<Permission> {
    try {
      return await this.permissionRepository.findOneOrFail({
        where: { idPermission: id, deletedAt: IsNull() },
        relations: { role: true, module: true },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe el permiso con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar el permiso. ${getErrorMessage(error)}`);
    }
  }

  async create(dto: CreatePermissionDto): Promise<Permission> {
    try {
      const role = await this.roleRepository.findOne({
        where: { idRole: dto.idRole, deletedAt: IsNull() },
      });
      const module = await this.moduleRepository.findOne({
        where: { idModule: dto.idModule, deletedAt: IsNull() },
      });
      if (!role) {
        throw new NotFoundException(`No existe el rol con ID ${dto.idRole}`);
      }
      if (!module) {
        throw new NotFoundException(`No existe el módulo con ID ${dto.idModule}`);
      }
      const permission = this.permissionRepository.create({
        role,
        module,
        canCreate: dto.canCreate,
        canRead: dto.canRead,
        canUpdate: dto.canUpdate,
        canDelete: dto.canDelete,
        canRestore: dto.canRestore,
      });
      return await this.permissionRepository.save(permission);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (getPgErrorCode(error) === '23505') {
        throw new ConflictException('Ya existe un permiso activo para este rol y módulo.');
      }
      throw new BadRequestException(`Error al crear el permiso. ${getErrorMessage(error)}`);
    }
  }

  async update(id: number, changes: UpdatePermissionDto): Promise<Permission> {
    try {
      const result = await this.findOne(id);
      if (changes.idRole !== undefined || changes.idModule !== undefined) {
        const idRole = changes.idRole ?? result.role.idRole;
        const idModule = changes.idModule ?? result.module.idModule;
        const role = await this.roleRepository.findOne({
          where: { idRole, deletedAt: IsNull() },
        });
        const module = await this.moduleRepository.findOne({
          where: { idModule, deletedAt: IsNull() },
        });
        if (!role) {
          throw new NotFoundException(`No existe el rol con ID ${idRole}`);
        }
        if (!module) {
          throw new NotFoundException(`No existe el módulo con ID ${idModule}`);
        }
        result.role = role;
        result.module = module;
      }
      if (changes.canCreate !== undefined) {
        result.canCreate = changes.canCreate;
      }
      if (changes.canRead !== undefined) {
        result.canRead = changes.canRead;
      }
      if (changes.canUpdate !== undefined) {
        result.canUpdate = changes.canUpdate;
      }
      if (changes.canDelete !== undefined) {
        result.canDelete = changes.canDelete;
      }
      if (changes.canRestore !== undefined) {
        result.canRestore = changes.canRestore;
      }
      return await this.permissionRepository.save(result);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (getPgErrorCode(error) === '23505') {
        throw new ConflictException('Ya existe un permiso activo para este rol y módulo.');
      }
      throw new BadRequestException(`Error al actualizar el permiso. ${getErrorMessage(error)}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.findOne(id);
      await this.permissionRepository.softDelete({ idPermission: id });
      return true;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar el permiso. ${getErrorMessage(error)}`);
    }
  }

  async restore(id: number) {
    const result = await this.permissionRepository.restore({ idPermission: id });
    if (result.affected === 0) {
      throw new NotFoundException(`No se encontró un permiso eliminado con ID ${id}`);
    }
    return { message: 'Registro restaurado exitosamente' };
  }
}
