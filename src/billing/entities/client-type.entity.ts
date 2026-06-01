import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Client } from './client.entity';

@Entity('client_types')
export class ClientType extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_client_type' })
  idClientType: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @OneToMany(() => Client, (client) => client.clientType)
  clients: Client[];
}
