export interface EventEmailData {
  id: string;
  title: string;
  location: string;
  startsAt: string;
  endsAt: string;
}

export interface EmailJobPayload {
  recipient: string;
  event: EventEmailData;
}
