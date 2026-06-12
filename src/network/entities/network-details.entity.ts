import { BaseEntity } from '@/common/entities/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Subscription } from '@/billing/entities/subscription.entity';
import { DeviceType } from './device-type.entity';

@Entity('network_details')
@Index((networkDetail: NetworkDetails) => [networkDetail.subscription], { unique: true, where: 'deleted_at IS NULL' })
export class NetworkDetails extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_network_detail' })
  idNetworkDetail: number;

  @Column({ name: 'device_hostname', type: 'varchar', length: 100 })
  deviceHostname: string;

  @Column({ name: 'mac_address', type: 'varchar', length: 100 })
  macAddress: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 100 })
  ipAddress: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.networkDetail)
  @JoinColumn({
    name: 'id_subscription',
    referencedColumnName: 'idSubscription',
    foreignKeyConstraintName: 'fk_network_details_subscription',
  })
  subscription: Subscription;

  @RelationId((networkDetail: NetworkDetails) => networkDetail.subscription)
  idSubscription: number;

  @ManyToOne(() => DeviceType, (deviceType) => deviceType.networkDetails)
  @JoinColumn({ name: 'id_device_type', referencedColumnName: 'idDeviceType' })
  deviceType: DeviceType;

  @RelationId((networkDetail: NetworkDetails) => networkDetail.deviceType)
  idDeviceType: number;
}
