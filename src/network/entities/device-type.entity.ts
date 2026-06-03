import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { NetworkDetails } from './network-details.entity';

@Entity('device_types')
export class DeviceType extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_device_type' })
  idDeviceType: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  icon: string | null;

  @OneToMany(() => NetworkDetails, (networkDetails) => networkDetails.deviceType)
  networkDetails: NetworkDetails[];
}
