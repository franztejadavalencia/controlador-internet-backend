import { BaseEntity } from '@/common/entities/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Subscription } from '@/billing/entities/subscription.entity';
import { DeviceType } from './device-type.entity';

@Entity('network_details')
export class NetworkDetails extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_network_detail' })
  idNetworkDetail: number;

  @Column({ name: 'device_hostname', type: 'varchar', length: 100 })
  deviceHostname: string;

  @Column({ name: 'mac_address', type: 'varchar', length: 100 })
  macAddress: string;

  @Column({ name: 'ip_address', type: 'varchar', length: 100 })
  ipAddress: string;

  @OneToOne(() => Subscription, (subscription) => subscription.networkDetail)
  @JoinColumn({ name: 'id_subscription', referencedColumnName: 'idSubscription' })
  subscription: Subscription;

  @RelationId((networkDetail: NetworkDetails) => networkDetail.subscription)
  idSubscription: number;

  @ManyToOne(() => DeviceType, (deviceType) => deviceType.networkDetails)
  @JoinColumn({ name: 'id_device_type', referencedColumnName: 'idDeviceType' })
  deviceType: DeviceType;

  @RelationId((networkDetail: NetworkDetails) => networkDetail.deviceType)
  idDeviceType: number;
}
