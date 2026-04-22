import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { AccessModuleController } from './controllers/access-module.controller';
import { PermissionController } from './controllers/permission.controller';
import { RoleController } from './controllers/role.controller';
import { UserRoleController } from './controllers/user-role.controller';
import { ModuleEntity } from './entities/module.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { ModuleService } from './services/module.service';
import { PermissionService } from './services/permission.service';
import { RoleService } from './services/role.service';
import { UserRoleService } from './services/user-role.service';

@Module({
  imports: [TypeOrmModule.forFeature([Role, ModuleEntity, Permission, UserRole, User])],
  exports: [TypeOrmModule],
  providers: [RoleService, ModuleService, PermissionService, UserRoleService],
  controllers: [RoleController, AccessModuleController, PermissionController, UserRoleController],
})
export class AccessControlModule {}
