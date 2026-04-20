import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { ModuleEntity } from './module.entity';
import { Role } from './role.entity';

@Entity('permissions')
@Index(['role', 'module'], { unique: true, where: 'deleted_at IS NULL' })
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_permission' })
  idPermission: number;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_role', referencedColumnName: 'idRole' })
  role: Role;

  @ManyToOne(() => ModuleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_module', referencedColumnName: 'idModule' })
  module: ModuleEntity;

  @Column({ name: 'can_create', type: 'boolean', default: false })
  canCreate: boolean;

  @Column({ name: 'can_read', type: 'boolean', default: false })
  canRead: boolean;

  @Column({ name: 'can_update', type: 'boolean', default: false })
  canUpdate: boolean;

  @Column({ name: 'can_delete', type: 'boolean', default: false })
  canDelete: boolean;

  @Column({ name: 'can_restore', type: 'boolean', default: false })
  canRestore: boolean;
}
