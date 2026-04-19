import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Stack, ToggleButton, ToggleButtonGroup, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEventsStore } from '../features/events/store/eventsStore';
import { EventList } from '../features/events/components/EventList';
import { PageLayout } from '../shared/components/PageLayout';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { ConfirmDialog } from '../shared/components/ConfirmDialog';
import { useNotification } from '../shared/hooks/useNotification';
import { getErrorMessage } from '../shared/utils/errorMessage';
import { EventStatus } from '../features/events/models/event.types';
import type { EventItem } from '../features/events/models/event.types';

export function EventsPage() {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  const {
    events,
    loading,
    error,
    statusFilter,
    fetchEvents,
    toggleEventStatus,
    deleteEvent,
    setStatusFilter,
  } = useEventsStore();

  const [eventToDelete, setEventToDelete] = useState<EventItem | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents =
    statusFilter === 'ALL' ? events : events.filter((e) => e.status === statusFilter);

  const handleToggleStatus = async (event: EventItem) => {
    try {
      await toggleEventStatus(event.id, event.status);
      notifySuccess('Státusz sikeresen frissítve.');
    } catch (error) {
      notifyError(getErrorMessage(error, 'Nem sikerült frissíteni a státuszt.'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    try {
      await deleteEvent(eventToDelete.id);
      notifySuccess('Esemény sikeresen törölve.');
    } catch (error) {
      notifyError(getErrorMessage(error, 'Nem sikerült törölni az eseményt.'));
    } finally {
      setEventToDelete(null);
    }
  };

  const handleFilterChange = (_: unknown, value: EventStatus | 'ALL' | null) => {
    if (value !== null) setStatusFilter(value);
  };

  return (
    <PageLayout
      title="Események"
      actions={
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/events/new')}
        >
          Új esemény
        </Button>
      }
    >
      <Stack spacing={3}>
        <ToggleButtonGroup
          value={statusFilter}
          exclusive
          onChange={handleFilterChange}
          size="small"
        >
          <ToggleButton value="ALL">Összes</ToggleButton>
          <ToggleButton value="DRAFT">Vázlat</ToggleButton>
          <ToggleButton value="PUBLISHED">Publikált</ToggleButton>
        </ToggleButtonGroup>

        {error && <Alert severity="error">{error}</Alert>}

        {loading ? (
          <LoadingSpinner />
        ) : (
          <EventList
            events={filteredEvents}
            onDelete={setEventToDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </Stack>

      <ConfirmDialog
        open={!!eventToDelete}
        title="Esemény törlése"
        description={`Biztosan törölni szeretnéd a(z) „${eventToDelete?.title}" eseményt? Ez a művelet nem vonható vissza.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setEventToDelete(null)}
      />
    </PageLayout>
  );
}
