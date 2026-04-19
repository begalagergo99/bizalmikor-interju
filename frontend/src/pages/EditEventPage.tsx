import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Paper, Alert, Stack, Button, Typography } from '@mui/material';
import { useEventsStore } from '../features/events/store/eventsStore';
import { EventStatus } from '../features/events/models/event.types';
import { EventForm } from '../features/events/components/EventForm';
import { StatusChip } from '../features/events/components/StatusChip';
import { useEventForm } from '../features/events/form/useEventForm';
import { PageLayout } from '../shared/components/PageLayout';
import { LoadingSpinner } from '../shared/components/LoadingSpinner';
import { useNotification } from '../shared/hooks/useNotification';
import { getErrorMessage } from '../shared/utils/errorMessage';

export function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();

  const {
    selectedEvent,
    loading,
    error,
    fetchEventById,
    updateEvent,
    toggleEventStatus,
    clearSelectedEvent,
  } = useEventsStore();

  const { values, errors, setField, addParticipant, removeParticipant, validate, initializeFrom } =
    useEventForm();

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) fetchEventById(id);
    return () => clearSelectedEvent();
  }, [id, fetchEventById, clearSelectedEvent]);

  useEffect(() => {
    if (selectedEvent) initializeFrom(selectedEvent);
  }, [selectedEvent, initializeFrom]);

  const handleSubmit = async () => {
    if (!id || !validate()) return;

    setIsSubmitting(true);
    try {
      await updateEvent(id, values);
      notifySuccess('Esemény sikeresen frissítve.');
      navigate('/events');
    } catch (error) {
      notifyError(getErrorMessage(error, 'Nem sikerült frissíteni az eseményt.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !selectedEvent) return;
    try {
      await toggleEventStatus(id, selectedEvent.status);
      notifySuccess('Státusz sikeresen frissítve.');
    } catch (error) {
      notifyError(getErrorMessage(error, 'Nem sikerült frissíteni a státuszt.'));
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <PageLayout title="Esemény szerkesztése">
        <Alert severity="error">{error}</Alert>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Esemény szerkesztése"
      breadcrumbs={[
        { label: 'Események', href: '/events' },
        { label: selectedEvent?.title ?? '…' },
      ]}
    >
      <Stack spacing={3}>
        {selectedEvent && (
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography variant="subtitle1">Aktuális státusz:</Typography>
              <StatusChip status={selectedEvent.status} />
              <Button variant="outlined" size="small" onClick={handleToggleStatus}>
                {selectedEvent.status === EventStatus.DRAFT ? 'Publikálás' : 'Visszaállítás vázlatra'}
              </Button>
            </Stack>
          </Paper>
        )}

        <Paper sx={{ p: 4 }}>
          <EventForm
            values={values}
            errors={errors}
            isSubmitting={isSubmitting}
            submitLabel="Mentés"
            onFieldChange={setField}
            onAddParticipant={addParticipant}
            onRemoveParticipant={removeParticipant}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/events')}
          />
        </Paper>
      </Stack>
    </PageLayout>
  );
}
