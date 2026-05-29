import { BaseEntity } from '@/common/entities/base.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { Subscription } from '@/billing/entities/subscription.entity';

@Entity('network_details')
export class NetworkDetails extends BaseEntity {
	@PrimaryGeneratedColumn({ name: 'id_network_detail' })
	idNetworkDetail: number;

	@Column({ name: 'mac_address', type: 'varchar', length: 100 })
	macAddress: string;

	@Column({ name: 'ip_address', type: 'varchar', length: 100 })
	ipAddress: string;

	@Column({ name: 'device_type', type: 'varchar', length: 100 })
	deviceType: string;

	@OneToOne(() => Subscription, (subscription) => subscription.networkDetail)
	@JoinColumn({ name: 'id_subscription', referencedColumnName: 'idSubscription' })
	subscription: Subscription;

	@RelationId((networkDetail: NetworkDetails) => networkDetail.subscription)
	idSubscription: number;
}