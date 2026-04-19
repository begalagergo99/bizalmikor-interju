import { create } from 'zustand';
import { EventStatus } from '../models/event.types';
import type { EventItem, CreateEventPayload, UpdateEventPayload } from '../models/event.types';
import { eventsApi } from '../api/eventsApi';
import { getErrorMessage } from '../../../shared/utils/errorMessage';

interface EventsState {
  events: EventItem[];
  selectedEvent: EventItem | null;
  loading: boolean;
  error: string | null;
  statusFilter: EventStatus | 'ALL';
}

interface EventsActions {
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<void>;
  createEvent: (payload: CreateEventPayload) => Promise<EventItem>;
  updateEvent: (id: string, payload: UpdateEventPayload) => Promise<void>;
  toggleEventStatus: (id: string, currentStatus: EventStatus) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  setStatusFilter: (filter: EventStatus | 'ALL') => void;
  clearSelectedEvent: () => void;
}

type EventsStore = EventsState & EventsActions;

export const useEventsStore = create<EventsStore>((set) => ({
  events: [],
  selectedEvent: null,
  loading: false,
  error: null,
  statusFilter: 'ALL',

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const events = await eventsApi.getAll();
      set({ events, loading: false });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Nem sikerült betölteni az eseményeket.'),
        loading: false,
      });
    }
  },

  fetchEventById: async (id) => {
    set({ loading: true, error: null, selectedEvent: null });
    try {
      const event = await eventsApi.getById(id);
      set({ selectedEvent: event, loading: false });
    } catch (err) {
      set({
        error: getErrorMessage(err, 'Nem sikerült betölteni az eseményt.'),
        loading: false,
      });
    }
  },

  createEvent: async (payload) => {
    const event = await eventsApi.create(payload);
    set((state) => ({ events: [...state.events, event] }));
    return event;
  },

  updateEvent: async (id, payload) => {
    const updated = await eventsApi.update(id, payload);
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? updated : e)),
      selectedEvent: state.selectedEvent?.id === id ? updated : state.selectedEvent,
    }));
  },

  toggleEventStatus: async (id, currentStatus) => {
    const nextStatus: EventStatus = currentStatus === EventStatus.DRAFT ? EventStatus.PUBLISHED : EventStatus.DRAFT;
    const updated = await eventsApi.updateStatus(id, nextStatus);
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? updated : e)),
      selectedEvent: state.selectedEvent?.id === id ? updated : state.selectedEvent,
    }));
  },

  deleteEvent: async (id) => {
    await eventsApi.delete(id);
    set((state) => ({
      events: state.events.filter((e) => e.id !== id),
      selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
    }));
  },

  setStatusFilter: (filter) => set({ statusFilter: filter }),
  clearSelectedEvent: () => set({ selectedEvent: null }),
}));
