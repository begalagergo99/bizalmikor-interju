import { useState, useCallback } from 'react';
import type { EventItem, Participant } from '../models/event.types';
import { validateEventForm, type FormErrors } from '../utils/eventValidation';

export interface EventFormValues {
  title: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  startsAt: string;
  endsAt: string;
  participants: Participant[];
}

interface UseEventFormReturn {
  values: EventFormValues;
  errors: FormErrors;
  setField: <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => void;
  addParticipant: (email: string) => boolean;
  removeParticipant: (email: string) => void;
  validate: () => boolean;
  reset: () => void;
  initializeFrom: (event: EventItem) => void;
}

const defaultValues: EventFormValues = {
  title: '',
  location: '',
  latitude: null,
  longitude: null,
  startsAt: '',
  endsAt: '',
  participants: [],
};

export function useEventForm(): UseEventFormReturn {
  const [values, setValues] = useState<EventFormValues>(defaultValues);
  const [errors, setErrors] = useState<FormErrors>({});

  const setField = useCallback(
    <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    [],
  );

  const addParticipant = useCallback(
    (email: string): boolean => {
      const normalized = email.toLowerCase().trim();
      if (!normalized) return false;

      const alreadyExists = values.participants.some(
        (p) => p.email.toLowerCase() === normalized,
      );
      if (alreadyExists) return false;

      setValues((prev) => ({
        ...prev,
        participants: [...prev.participants, { email: normalized }],
      }));
      setErrors((prev) => ({ ...prev, participants: undefined }));
      return true;
    },
    [values.participants],
  );

  const removeParticipant = useCallback((email: string) => {
    setValues((prev) => ({
      ...prev,
      participants: prev.participants.filter((p) => p.email !== email),
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors = validateEventForm(values);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const reset = useCallback(() => {
    setValues(defaultValues);
    setErrors({});
  }, []);

  const initializeFrom = useCallback((event: EventItem) => {
    setValues({
      title: event.title,
      location: event.location,
      latitude: event.latitude,
      longitude: event.longitude,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      participants: event.participants,
    });
    setErrors({});
  }, []);

  return { values, errors, setField, addParticipant, removeParticipant, validate, reset, initializeFrom };
}
