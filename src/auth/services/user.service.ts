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
import { hashPassword, verifyPassword } from '../../common/utils/password-hasher';
import { ChangePasswordUserDto } from '../dto/change-password-user.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { Person } from '../entities/person.entity';
import { User } from '../entities/user.entity';
import { LoggerActionInterface } from '@/common/interfaces/logger-action.interface';
import { LogService } from '@/audit/services/log.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly logService: LogService,
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

  async create(dto: CreateUserDto, loggerAction: LoggerActionInterface): Promise<User> {
    try {
      const person = await this.personRepository.findOne({
        where: { idPerson: dto.idPerson, deletedAt: IsNull() },
      });
      if (!person) {
        throw new NotFoundException(`No existe la persona con ID ${dto.idPerson}`);
      }
      const defaultPasswordHash = await hashPassword(person.ci);
      const user = this.userRepository.create({
        username: dto.username,
        passwordHash: defaultPasswordHash,
        twoFactorSecret: null,
        person,
      });
      return await this.userRepository.save(user);
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
        if (detail.includes('username')) {
          throw new ConflictException(`El nombre de usuario "${dto.username}" ya está en uso.`);
        }
      }
      throw new BadRequestException(`Error al crear el usuario. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }

  async update(
    id: number,
    changes: UpdateUserDto,
    loggerAction: LoggerActionInterface,
  ): Promise<User> {
    try {
      const result = await this.findOne(id);
      this.userRepository.merge(result, changes);
      return await this.userRepository.save(result);
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
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
      await this.userRepository.softDelete({ idUser: id });
      return true;
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al eliminar el usuario. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }

  async restore(id: number, loggerAction: LoggerActionInterface) {
    try {
      const result = await this.userRepository.restore({ idUser: id });
      if (result.affected === 0) {
        throw new NotFoundException(`No se encontró un usuario eliminado con ID ${id}`);
      }
      return { message: 'Registro restaurado exitosamente' };
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(`Error al restaurar el usuario. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }

  async changePassword(
    id: number,
    dto: ChangePasswordUserDto,
    loggerAction: LoggerActionInterface,
  ): Promise<{ message: string }> {
    try {
      const user = await this.findOne(id);
      const isOldPasswordValid = await verifyPassword(dto.oldPassword, user.passwordHash);

      if (!isOldPasswordValid) {
        throw new BadRequestException('La contraseña actual es incorrecta.');
      }

      user.passwordHash = await hashPassword(dto.newPassword);
      await this.userRepository.save(user);

      return { message: 'Contraseña actualizada correctamente.' };
    } catch (error: unknown) {
      loggerAction.action = `${loggerAction.action}_ERROR`;
      if (error instanceof HttpException) {
        throw error;
      }
      throw new BadRequestException(`Error al cambiar la contraseña. ${getErrorMessage(error)}`);
    } finally {
      await this.logService.create({
        idUser: 0,
        ...loggerAction,
      });
    }
  }
}
