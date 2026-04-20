import { Column, Entity, Index, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { User } from './user.entity';

@Entity('people')
@Index(['ci'], { unique: true, where: 'deleted_at IS NULL' })
@Index(['email'], { unique: true, where: 'deleted_at IS NULL' })
export class Person extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_person' })
  idPerson: number;

  @Column({ name: 'first_name', type: 'varchar', length: 255 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 255 })
  lastName: string;

  @Column({ type: 'varchar', length: 32 })
  ci: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @OneToOne(() => User, (user) => user.person)
  user?: User;
}
