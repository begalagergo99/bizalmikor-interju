import axios, { type AxiosError } from 'axios';
import type { EventItem, CreateEventPayload, UpdateEventPayload, EventStatus } from '../models/event.types';

const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3000',
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string | string[] }>) => {
    const msg = error.response?.data?.message;
    const readable = Array.isArray(msg) ? msg.join(', ') : (msg ?? error.message);
    return Promise.reject(new Error(readable));
  },
);

export const eventsApi = {
  getAll(): Promise<EventItem[]> {
    return apiClient.get<EventItem[]>('/events').then((res) => res.data);
  },

  getById(id: string): Promise<EventItem> {
    return apiClient.get<EventItem>(`/events/${encodeURIComponent(id)}`).then((res) => res.data);
  },

  create(payload: CreateEventPayload): Promise<EventItem> {
    const body = {
      ...payload,
      participants: payload.participants?.map((p) => p.email),
    };
    return apiClient.post<EventItem>('/events', body).then((res) => res.data);
  },

  update(id: string, payload: UpdateEventPayload): Promise<EventItem> {
    const body = {
      ...payload,
      participants: payload.participants?.map((p) => p.email),
    };
    return apiClient.patch<EventItem>(`/events/${encodeURIComponent(id)}`, body).then((res) => res.data);
  },

  updateStatus(id: string, status: EventStatus): Promise<EventItem> {
    return apiClient
      .patch<EventItem>(`/events/${encodeURIComponent(id)}/status`, { status })
      .then((res) => res.data);
  },

  delete(id: string): Promise<void> {
    return apiClient.delete(`/events/${encodeURIComponent(id)}`).then(() => undefined);
  },
};
