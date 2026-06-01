import {
    Column,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
  } from 'typeorm';
  import { BaseEntity } from '@/common/entities/base.entity';
  import { Subscription } from './subscription.entity';
  
  @Entity('subscription_status')
  export class SubscriptionStatus extends BaseEntity {
    @PrimaryGeneratedColumn({ name: 'id_subscription_status' })
    idSubscriptionStatus: number;
  
    @Column({ type: 'varchar', length: 100 })
    name: string;
  
    @OneToMany(() => Subscription, (subscription) => subscription.subscriptionStatus)
    subscriptions: Subscription[];
  }
  