import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Person } from '@/auth/entities/person.entity';
import { Subscription } from './subscription.entity';

@Entity('clients')
export class Client extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_client' })
  idClient: number;

  @Column({ name: 'client_type', type: 'varchar', length: 100 })
  clientType: string;

  @OneToOne(() => Person, (person) => person.client)
  @JoinColumn({ name: 'id_person', referencedColumnName: 'idPerson' })
  person: Person;

  @RelationId((client: Client) => client.person)
  idPerson: number;

  @OneToMany(() => Subscription, (subscription) => subscription.client)
  subscriptions: Subscription[];
}
