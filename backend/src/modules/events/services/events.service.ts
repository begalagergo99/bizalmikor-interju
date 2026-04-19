import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventsRepository } from '../repositories/events.repository';
import { Event, EventStatus } from '../entities/event.entity';
import { Participant } from '../../participants/entities/participant.entity';
import { CreateEventDto } from '../models/create-event.dto';
import { UpdateEventDto } from '../models/update-event.dto';
import { UpdateEventStatusDto } from '../models/update-event-status.dto';
import { EventMapper } from '../mappers/event.mapper';
import { EventResponse } from '../models/event-response.types';
import { EmailProducer } from '../../queue/producers/email.producer';

@Injectable()
export class EventsService {
  constructor(
    private readonly eventsRepository: EventsRepository,
    private readonly emailProducer: EmailProducer,
  ) {}

  async findAll(): Promise<EventResponse[]> {
    const events = await this.eventsRepository.findAll();
    return EventMapper.toResponseList(events);
  }

  async findOne(id: string): Promise<EventResponse> {
    const event = await this.getEventOrThrow(id);
    return EventMapper.toResponse(event);
  }

  async create(dto: CreateEventDto): Promise<EventResponse> {
    const startsAt = new Date(dto.startsAt);
    const endsAt = new Date(dto.endsAt);
    this.assertValidDateRange(startsAt, endsAt);

    const event = new Event();
    event.title = dto.title;
    event.location = dto.location;
    event.latitude = this.normalizeCoordinate(dto.latitude);
    event.longitude = this.normalizeCoordinate(dto.longitude);
    event.startsAt = startsAt;
    event.endsAt = endsAt;
    event.status = EventStatus.DRAFT;
    event.participants = this.buildParticipants(dto.participants ?? []);

    const saved = await this.eventsRepository.save(event);
    return EventMapper.toResponse(saved);
  }

  async update(id: string, dto: UpdateEventDto): Promise<EventResponse> {
    const event = await this.getEventOrThrow(id);

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : event.startsAt;
    const endsAt = dto.endsAt ? new Date(dto.endsAt) : event.endsAt;
    const location = dto.location ?? event.location;
    const latitude =
      dto.latitude !== undefined
        ? this.normalizeCoordinate(dto.latitude)
        : event.latitude;
    const longitude =
      dto.longitude !== undefined
        ? this.normalizeCoordinate(dto.longitude)
        : event.longitude;

    this.assertValidDateRange(startsAt, endsAt);
    const coordinates = this.getCoordinatesOrThrow(
      location,
      latitude,
      longitude,
    );

    const timeOrLocationChanged =
      (dto.location !== undefined && dto.location !== event.location) ||
      (dto.latitude !== undefined && latitude !== event.latitude) ||
      (dto.longitude !== undefined && longitude !== event.longitude) ||
      (dto.startsAt !== undefined &&
        startsAt.getTime() !== event.startsAt.getTime()) ||
      (dto.endsAt !== undefined && endsAt.getTime() !== event.endsAt.getTime());

    if (event.status === EventStatus.PUBLISHED && timeOrLocationChanged) {
      await this.assertNoConflicts(
        location,
        coordinates.latitude,
        coordinates.longitude,
        startsAt,
        endsAt,
        id,
      );
    }

    if (dto.title !== undefined) event.title = dto.title;
    if (dto.location !== undefined) event.location = location;
    if (dto.latitude !== undefined) event.latitude = latitude;
    if (dto.longitude !== undefined) event.longitude = longitude;
    if (dto.startsAt !== undefined) event.startsAt = startsAt;
    if (dto.endsAt !== undefined) event.endsAt = endsAt;
    const wasPublished = event.status === EventStatus.PUBLISHED;
    if (dto.participants !== undefined) {
      if (wasPublished) {
        const existingEmails = new Set(event.participants.map((p) => p.email));
        const incomingEmails = new Set(dto.participants);
        const retained = event.participants.filter((p) =>
          incomingEmails.has(p.email),
        );
        const newEmails = dto.participants.filter(
          (e) => !existingEmails.has(e),
        );
        event.participants = [
          ...retained,
          ...this.buildParticipants(newEmails),
        ];
      } else {
        event.participants = this.buildParticipants(dto.participants);
      }
    }

    const saved = await this.eventsRepository.save(event);

    if (wasPublished && dto.participants !== undefined && saved.participants.length > 0) {
      await this.emailProducer.enqueueEventPublishedEmails(
        saved.participants.map((p) => p.email),
        {
          id: saved.id,
          title: saved.title,
          location: saved.location,
          startsAt: saved.startsAt.toISOString(),
          endsAt: saved.endsAt.toISOString(),
        },
      );
      await this.eventsRepository.markParticipantsNotified(
        saved.participants.map((p) => p.id),
      );
    }

    return EventMapper.toResponse(saved);
  }

  async updateStatus(
    id: string,
    dto: UpdateEventStatusDto,
  ): Promise<EventResponse> {
    const event = await this.getEventOrThrow(id);

    if (event.status === dto.status) {
      return EventMapper.toResponse(event);
    }

    const isPublishing =
      event.status === EventStatus.DRAFT &&
      dto.status === EventStatus.PUBLISHED;

    if (isPublishing) {
      const coordinates = this.getCoordinatesOrThrow(
        event.location,
        event.latitude,
        event.longitude,
      );
      await this.assertNoConflicts(
        event.location,
        coordinates.latitude,
        coordinates.longitude,
        event.startsAt,
        event.endsAt,
        id,
      );
    }

    event.status = dto.status;
    const saved = await this.eventsRepository.save(event);

    if (isPublishing) {
      const unnotified = saved.participants.filter((p) => !p.notified);
      if (unnotified.length > 0) {
        await this.emailProducer.enqueueEventPublishedEmails(
          unnotified.map((p) => p.email),
          {
            id: saved.id,
            title: saved.title,
            location: saved.location,
            startsAt: saved.startsAt.toISOString(),
            endsAt: saved.endsAt.toISOString(),
          },
        );
        await this.eventsRepository.markParticipantsNotified(
          unnotified.map((p) => p.id),
        );
      }
    }

    return EventMapper.toResponse(saved);
  }

  async remove(id: string): Promise<void> {
    const event = await this.getEventOrThrow(id);
    await this.eventsRepository.remove(event);
  }

  private async getEventOrThrow(id: string): Promise<Event> {
    const event = await this.eventsRepository.findById(id);
    if (!event) {
      throw new NotFoundException(`Event with id "${id}" not found`);
    }
    return event;
  }

  private assertValidDateRange(startsAt: Date, endsAt: Date): void {
    if (startsAt > endsAt) {
      throw new BadRequestException(
        'startsAt must be before or equal to endsAt',
      );
    }
  }

  private async assertNoConflicts(
    location: string,
    latitude: number,
    longitude: number,
    startsAt: Date,
    endsAt: Date,
    excludeId: string,
  ): Promise<void> {
    const conflicts = await this.eventsRepository.findConflictingPublished(
      latitude,
      longitude,
      startsAt,
      endsAt,
      excludeId,
    );

    if (conflicts.length > 0) {
      throw new ConflictException(
        `A published event already exists at "${location}" during this time slot`,
      );
    }
  }

  private buildParticipants(emails: string[]): Participant[] {
    return emails.map((email) => {
      const participant = new Participant();
      participant.email = email;
      return participant;
    });
  }

  private getCoordinatesOrThrow(
    location: string,
    latitude: number | null,
    longitude: number | null,
  ): { latitude: number; longitude: number } {
    if (latitude === null || longitude === null) {
      throw new BadRequestException(
        `Location coordinates are required for "${location}"`,
      );
    }

    return { latitude, longitude };
  }

  private normalizeCoordinate(value: number): number {
    return Number(value.toFixed(5));
  }
}
