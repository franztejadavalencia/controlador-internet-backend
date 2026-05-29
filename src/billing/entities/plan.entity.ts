import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';

@Entity('plans')
export class Plans extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_plan' })
  idPlan: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;


}
