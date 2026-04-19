import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Event } from '../../events/entities/event.entity';

@Entity('participants')
@Unique('UQ_participant_event_email', ['event', 'email'])
export class Participant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ default: false })
  notified: boolean;

  @ManyToOne(() => Event, (event) => event.participants, {
    onDelete: 'CASCADE',
  })
  event: Event;
}
