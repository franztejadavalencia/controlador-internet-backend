import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('roles')
@Index(['name'], { unique: true, where: 'deleted_at IS NULL' })
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_role' })
  idRole: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;
}
