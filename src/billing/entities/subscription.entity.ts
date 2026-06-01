import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Plan } from '@/billing/entities/plan.entity';
import { Client } from '@/billing/entities/client.entity';
import { Payment } from './payment.entity';
import { NetworkDetails } from '@/network/entities/network-details.entity';

@Entity('subscriptions')
export class Subscription extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_subscription' })
  idSubscription: number;

  @Column({ type: 'varchar', length: 50, default: 'INACTIVO' })
  status: string;

  @Column({ name: 'expiration_date', type: 'timestamptz', nullable: true })
  expirationDate: Date | null;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  @JoinColumn({ name: 'id_plan', referencedColumnName: 'idPlan' })
  plan: Plan;

  @RelationId((subscription: Subscription) => subscription.plan)
  idPlan: number;

  @ManyToOne(() => Client, (client) => client.subscriptions)
  @JoinColumn({ name: 'id_client', referencedColumnName: 'idClient' })
  client: Client;

  @RelationId((subscription: Subscription) => subscription.client)
  idClient: number;

  @OneToMany(() => Payment, (payment) => payment.subscription)
  payments: Payment[];

  @OneToOne(() => NetworkDetails, (networkDetail) => networkDetail.subscription)
  networkDetail: NetworkDetails;
}
