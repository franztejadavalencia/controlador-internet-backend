import { Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from '../../auth/entities/user.entity';
import { Role } from './role.entity';

@Entity('users_roles')
@Index(['user', 'role'], { unique: true, where: 'deleted_at IS NULL' })
export class UserRole extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_user_role' })
  idUserRole: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user', referencedColumnName: 'idUser' })
  user: User;

  @ManyToOne(() => Role, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_role', referencedColumnName: 'idRole' })
  role: Role;
}
