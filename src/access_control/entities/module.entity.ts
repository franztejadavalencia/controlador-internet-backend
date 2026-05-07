import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('modules')
@Index(['name'], { unique: true, where: 'deleted_at IS NULL' })
export class ModuleEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_module' })
  idModule: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'integer' })
  group: number;

  @Column({ type: 'varchar', length: 50 })
  route: string;

  @Column({ type: 'integer' })
  order: number;
}
