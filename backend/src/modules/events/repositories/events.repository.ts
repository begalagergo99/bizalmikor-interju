import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Event, EventStatus } from '../entities/event.entity';
import { Participant } from '../../participants/entities/participant.entity';

@Injectable()
export class EventsRepository {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
    @InjectRepository(Participant)
    private readonly participantRepo: Repository<Participant>,
  ) {}

  findAll(): Promise<Event[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: string): Promise<Event | null> {
    return this.repo.findOneBy({ id });
  }

  async save(event: Event): Promise<Event> {
    try {
      return await this.repo.save(event);
    } catch (err) {
      if (
        err instanceof QueryFailedError &&
        (err as QueryFailedError & { code: string }).code === '23505' &&
        err.message.includes('UQ_participant_event_email')
      ) {
        throw new ConflictException(
          'Duplicate participant emails are not allowed for this event',
        );
      }
      throw err;
    }
  }

  async remove(event: Event): Promise<void> {
    await this.repo.remove(event);
  }

  async markParticipantsNotified(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.participantRepo.update(ids, { notified: true });
  }

  findConflictingPublished(
    latitude: number,
    longitude: number,
    startsAt: Date,
    endsAt: Date,
    excludeId?: string,
  ): Promise<Event[]> {
    const qb = this.repo
      .createQueryBuilder('event')
      .where('event.status = :status', { status: EventStatus.PUBLISHED })
      .andWhere('event.latitude = :latitude', { latitude })
      .andWhere('event.longitude = :longitude', { longitude })
      .andWhere('event.startsAt < :endsAt', { endsAt })
      .andWhere('event.endsAt > :startsAt', { startsAt });

    if (excludeId) {
      qb.andWhere('event.id != :excludeId', { excludeId });
    }

    return qb.getMany();
  }
}
