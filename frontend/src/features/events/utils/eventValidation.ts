import type { EventItem } from '../models/event.types';

type FormValues = Omit<EventItem, 'id' | 'status'>;

export interface FormErrors {
  title?: string;
  location?: string;
  startsAt?: string;
  endsAt?: string;
  participants?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim());
}

export function validateEventForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.title.trim()) {
    errors.title = 'A cím megadása kötelező.';
  }

  if (!values.location.trim()) {
    errors.location = 'A helyszín kiválasztása kötelező.';
  }

  if (values.latitude === null || values.longitude === null) {
    errors.location = 'Válassz helyszínt a térképen.';
  }

  if (!values.startsAt) {
    errors.startsAt = 'A kezdési időpont megadása kötelező.';
  }

  if (!values.endsAt) {
    errors.endsAt = 'A befejezési időpont megadása kötelező.';
  }

  if (
    values.startsAt &&
    values.endsAt &&
    new Date(values.startsAt) > new Date(values.endsAt)
  ) {
    errors.endsAt = 'A befejezési időpontnak a kezdési időpont után kell lennie.';
  }

  const emails = values.participants.map((p) => p.email.toLowerCase().trim());
  const uniqueEmails = new Set(emails);

  if (emails.length !== uniqueEmails.size) {
    errors.participants = 'Minden email cím csak egyszer szerepelhet.';
  } else {
    const invalid = values.participants.find((p) => !isValidEmail(p.email));
    if (invalid) {
      errors.participants = `Érvénytelen email cím: ${invalid.email}`;
    }
  }

  return errors;
}

export function toDatetimeLocal(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const pad = (value: number) => String(value).padStart(2, '0');

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-')
    .concat(`T${pad(date.getHours())}:${pad(date.getMinutes())}`);
}

export function fromDatetimeLocal(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString();
}
