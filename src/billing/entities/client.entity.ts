import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Person } from '@/auth/entities/person.entity';

@Entity('clients')
export class Client extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_client' })
  idClient: number;

  @Column({ type: 'varchar', length: 100 })
  client_type: string;

  @OneToOne(() => Person, (person) => person.client)
  @JoinColumn({ name: 'id_person', referencedColumnName: 'idPerson' })
  person: Person;

  @RelationId((client: Client) => client.person)
  idPerson: number;
}
