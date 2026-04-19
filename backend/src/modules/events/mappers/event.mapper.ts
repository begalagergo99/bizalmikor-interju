import { Event } from '../entities/event.entity';
import {
  EventResponse,
  ParticipantResponse,
} from '../models/event-response.types';

export class EventMapper {
  static toResponse(event: Event): EventResponse {
    return {
      id: event.id,
      title: event.title,
      status: event.status,
      location: event.location,
      latitude: event.latitude,
      longitude: event.longitude,
      startsAt: event.startsAt.toISOString(),
      endsAt: event.endsAt.toISOString(),
      participants: (event.participants ?? []).map(
        (p): ParticipantResponse => ({ id: p.id, email: p.email }),
      ),
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
  }

  static toResponseList(events: Event[]): EventResponse[] {
    return events.map((event) => EventMapper.toResponse(event));
  }
}
