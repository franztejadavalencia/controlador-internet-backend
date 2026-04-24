import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { Person } from './person.entity';

@Entity('users')
@Index(['username'], { unique: true, where: 'deleted_at IS NULL' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  idUser: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({
    name: 'two_factor_secret',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  twoFactorSecret: string | null;

  @Column({ name: 'is_two_factor_enabled', type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ type: 'varchar', length: 50, default: 'ACTIVO' })
  status: string;

  @OneToOne(() => Person, (person) => person.user)
  @JoinColumn({ name: 'id_person', referencedColumnName: 'idPerson' })
  person: Person;

  @RelationId((user: User) => user.person)
  idPerson: number;
}
