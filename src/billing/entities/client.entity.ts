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
import { Person } from '@/auth/entities/person.entity';
import { Subscription } from './subscription.entity';
import { ClientType } from './client-type.entity';

@Entity('clients')
export class Client extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_client' })
  idClient: number;

  @Column({ type: 'varchar', length: 100 })
  code: string;

  @OneToOne(() => Person, (person) => person.client)
  @JoinColumn({ name: 'id_person', referencedColumnName: 'idPerson' })
  person: Person;

  @RelationId((client: Client) => client.person)
  idPerson: number;

  @OneToMany(() => Subscription, (subscription) => subscription.client)
  subscriptions: Subscription[];

  @ManyToOne(() => ClientType, (clientType) => clientType.clients)
  @JoinColumn({ name: 'id_client_type', referencedColumnName: 'idClientType' })
  clientType: ClientType;

  @RelationId((client: Client) => client.clientType)
  idClientType: number;
}
