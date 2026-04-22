import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, IsNull, Not, Repository } from 'typeorm';
import { getErrorMessage, getPgErrorCode } from '../../common/utils/error-message';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Person } from '../entities/person.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async findAll(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: { deletedAt: IsNull() },
        relations: { person: true },
        order: { username: 'ASC' },
      });
    } catch (error: unknown) {
      throw new BadRequestException(`Error al obtener los usuarios. ${getErrorMessage(error)}`);
    }
  }

  async findAllTrashed(): Promise<User[]> {
    try {
      return await this.userRepository.find({
        where: { deletedAt: Not(IsNull()) },
        relations: { person: true },
        order: { username: 'ASC' },
        withDeleted: true,
      });
    } catch (error: unknown) {
      throw new BadRequestException(
        `Error al obtener los usuarios eliminados. ${getErrorMessage(error)}`,
      );
    }
  }

  async findOne(id: number): Promise<User> {
    try {
      return await this.userRepository.findOneOrFail({
        where: { idUser: id, deletedAt: IsNull() },
        relations: { person: true },
      });
    } catch (error: unknown) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(`No existe el usuario con ID ${id}`);
      }
      throw new BadRequestException(`Error al buscar el usuario. ${getErrorMessage(error)}`);
    }
  }

  async create(dto: CreateUserDto): Promise<User> {
    try {
      const person = await this.personRepository.findOne({
        where: { idPerson: dto.idPerson, deletedAt: IsNull() },
      });
      if (!person) {
        throw new NotFoundException(`No existe la persona con ID ${dto.idPerson}`);
      }
      const user = this.userRepository.create({
        username: dto.username,
        passwordHash: dto.passwordHash,
        twoFactorSecret: dto.twoFactorSecret ?? null,
        isTwoFactorEnabled: dto.isTwoFactorEnabled,
        status: dto.status,
        person,
      });
      return await this.userRepository.save(user);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (getPgErrorCode(error) === '23505') {
        const detail = String(
          typeof error === 'object' && error !== null && 'detail' in error
            ? (error as { detail?: unknown }).detail
            : '',
        );
        if (detail.includes('username')) {
          throw new ConflictException(`El nombre de usuario "${dto.username}" ya está en uso.`);
        }
      }
      throw new BadRequestException(`Error al crear el usuario. ${getErrorMessage(error)}`);
    }
  }

  async update(id: number, changes: UpdateUserDto): Promise<User> {
    try {
      const result = await this.findOne(id);
      this.userRepository.merge(result, changes);
      return await this.userRepository.save(result);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (getPgErrorCode(error) === '23505') {
        const username = changes.username;
        if (username) {
          throw new ConflictException(`El nombre de usuario "${username}" ya está en uso.`);
        }
      }
      throw new BadRequestException(`Error al actualizar el usuario. ${getErrorMessage(error)}`);
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      await this.findOne(id);
      await this.userRepository.softDelete({ idUser: id });
      return true;
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar el usuario. ${getErrorMessage(error)}`);
    }
  }

  async restore(id: number) {
    const result = await this.userRepository.restore({ idUser: id });
    if (result.affected === 0) {
      throw new NotFoundException(`No se encontró un usuario eliminado con ID ${id}`);
    }
    return { message: 'Registro restaurado exitosamente' };
  }
}
