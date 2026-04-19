import { Chip } from '@mui/material';
import { EventStatus } from '../models/event.types';

interface StatusChipProps {
  status: EventStatus;
}

const STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: 'Vázlat',
  PUBLISHED: 'Publikált',
};

export function StatusChip({ status }: StatusChipProps) {
  return (
    <Chip
      label={STATUS_LABELS[status]}
      size="small"
      color={status === EventStatus.PUBLISHED ? 'success' : 'default'}
      variant={status === EventStatus.PUBLISHED ? 'filled' : 'outlined'}
    />
  );
}
