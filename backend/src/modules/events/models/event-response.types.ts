import { EventStatus } from '../entities/event.entity';

export interface ParticipantResponse {
  id: string;
  email: string;
}

export interface EventResponse {
  id: string;
  title: string;
  status: EventStatus;
  location: string;
  latitude: number | null;
  longitude: number | null;
  startsAt: string;
  endsAt: string;
  participants: ParticipantResponse[];
  createdAt: string;
  updatedAt: string;
}
