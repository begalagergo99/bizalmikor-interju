import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import type { EventItem } from '../models/event.types';
import { EventListItem } from './EventListItem';

interface EventListProps {
  events: EventItem[];
  onDelete: (event: EventItem) => void;
  onToggleStatus: (event: EventItem) => void;
}

export function EventList({ events, onDelete, onToggleStatus }: EventListProps) {
  if (events.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="text.secondary">
          Nincs megjeleníthető esemény.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Esemény neve</TableCell>
            <TableCell>Státusz</TableCell>
            <TableCell>Helyszín</TableCell>
            <TableCell>Kezdés</TableCell>
            <TableCell>Befejezés</TableCell>
            <TableCell align="center">Résztvevők</TableCell>
            <TableCell align="right">Műveletek</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map((event) => (
            <EventListItem
              key={event.id}
              event={event}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
