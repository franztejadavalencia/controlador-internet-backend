import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Subscription } from '@/billing/entities/subscription.entity';

@Entity('payments')
export class Payment extends BaseEntity {
	@PrimaryGeneratedColumn({ name: 'id_payment' })
	idPayment: number;

	@Column({ type: 'decimal', precision: 10, scale: 2 })
	amount: number;

	@Column({ name: 'payment_date', type: 'timestamptz' })
	paymentDate: Date;

	@Column({ name: 'monts_payed', type: 'integer' })
	montsPayed: number;

	@ManyToOne(() => Subscription, (subscription) => subscription.payments)
	@JoinColumn({ name: 'id_subscription', referencedColumnName: 'idSubscription' })
	subscription: Subscription;

	@RelationId((payment: Payment) => payment.subscription)
	idSubscription: number;
}