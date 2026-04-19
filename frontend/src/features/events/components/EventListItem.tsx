import { TableRow, TableCell, IconButton, Tooltip, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useNavigate } from 'react-router-dom';
import { EventStatus } from '../models/event.types';
import type { EventItem } from '../models/event.types';
import { StatusChip } from './StatusChip';

interface EventListItemProps {
  event: EventItem;
  onDelete: (event: EventItem) => void;
  onToggleStatus: (event: EventItem) => void;
}

function formatDate(isoString: string): string {
  if (!isoString) return '–';
  return new Intl.DateTimeFormat('hu-HU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoString));
}

export function EventListItem({ event, onDelete, onToggleStatus }: EventListItemProps) {
  const navigate = useNavigate();

  return (
    <TableRow hover>
      <TableCell>{event.title}</TableCell>
      <TableCell>
        <StatusChip status={event.status} />
      </TableCell>
      <TableCell>{event.location}</TableCell>
      <TableCell>{formatDate(event.startsAt)}</TableCell>
      <TableCell>{formatDate(event.endsAt)}</TableCell>
      <TableCell align="center">{event.participants.length}</TableCell>
      <TableCell align="right">
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title={event.status === EventStatus.DRAFT ? 'Publikálás' : 'Visszaállítás vázlatra'}>
            <IconButton
              size="small"
              onClick={() => onToggleStatus(event)}
              aria-label="Státusz váltása"
            >
              <SwapHorizIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Szerkesztés">
            <IconButton
              size="small"
              onClick={() => navigate(`/events/${event.id}/edit`)}
              aria-label="Szerkesztés"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Törlés">
            <IconButton
              size="small"
              onClick={() => onDelete(event)}
              aria-label="Törlés"
              color="error"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </TableCell>
    </TableRow>
  );
}
