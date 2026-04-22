import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, IsNull, Not, Repository } from 'typeorm';
import { getErrorMessage, getPgErrorCode } from '../../common/utils/error-message';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    try {
      return await this.roleRepository.find({
        where: { deletedAt: IsNull() },
        order: { name: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los roles. ${getErrorMessage(error)}`);
    }
  }

  async findAllTrashed(): Promise<Role[]> {
    try {
      return await this.roleRepository.find({
        where: { deletedAt: Not(IsNull()) },
        order: { name: 'ASC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener los roles eliminados. ${getErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: number): Promise<Role> {
    try {
      return await this.roleRepository.findOneOrFail({
        where: { idRole: id, deletedAt: IsNull() },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe el rol con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar el rol. ${getErrorMessage(error)}`);
    }
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    try {
      const role = this.roleRepository.create(dto);
      return await this.roleRepository.save(role);
    } catch (error: unknown) {
      if (getPgErrorCode(error) === '23505') {
        throw new ConflictException(`El nombre "${dto.name}" ya está en uso.`);
      }
      throw new BadRequestException(`Error al crear el rol. ${getErrorMessage(error)}`);
    }
  }

  async update(id: number, changes: UpdateRoleDto): Promise<Role> {
    try {
      const result = await this.findOne(id);
      this.roleRepository.merge(result, changes);
      return await this.roleRepository.save(result);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (getPgErrorCode(error) === '23505' && changes.name) {
        throw new ConflictException(`El nombre "${changes.name}" ya está en uso.`);
      }
      throw new BadRequestException(`Error al actualizar el rol. ${getErrorMessage(error)}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.findOne(id);
      await this.roleRepository.softDelete({ idRole: id });
      return true;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar el rol. ${getErrorMessage(error)}`);
    }
  }

  async restore(id: number) {
    const result = await this.roleRepository.restore({ idRole: id });
    if (result.affected === 0) {
      throw new NotFoundException(`No se encontró un rol eliminado con ID ${id}`);
    }
    return { message: 'Registro restaurado exitosamente' };
  }
}
