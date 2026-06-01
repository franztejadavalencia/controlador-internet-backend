import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Subscription } from './subscription.entity';

@Entity('plans')
@Index(['name'], { unique: true, where: 'deleted_at IS NULL' })
export class Plan extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_plan' })
  idPlan: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'download_speed', type: 'integer' })
  downloadSpeed: number;

  @Column({ name: 'upload_speed', type: 'integer' })
  uploadSpeed: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ name: 'is_active', type: 'boolean', default: 'false' })
  isActive: boolean;

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];
}
