export enum EventStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface Participant {
  id?: string;
  email: string;
}

export interface EventItem {
  id: string;
  title: string;
  status: EventStatus;
  location: string;
  latitude: number | null;
  longitude: number | null;
  startsAt: string;
  endsAt: string;
  participants: Participant[];
  createdAt: string;
  updatedAt: string;
}

export type CreateEventPayload = Omit<EventItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

export type UpdateEventPayload = Partial<Omit<EventItem, 'id' | 'status' | 'createdAt' | 'updatedAt'>>;
