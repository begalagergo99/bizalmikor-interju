import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Paper } from '@mui/material';
import { useEventsStore } from '../features/events/store/eventsStore';
import { EventForm } from '../features/events/components/EventForm';
import { useEventForm } from '../features/events/form/useEventForm';
import { PageLayout } from '../shared/components/PageLayout';
import { useNotification } from '../shared/hooks/useNotification';
import { getErrorMessage } from '../shared/utils/errorMessage';

export function NewEventPage() {
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useNotification();
  const { createEvent } = useEventsStore();
  const { values, errors, setField, addParticipant, removeParticipant, validate } = useEventForm();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await createEvent(values);
      notifySuccess('Esemény sikeresen létrehozva.');
      navigate('/events');
    } catch (error) {
      notifyError(getErrorMessage(error, 'Nem sikerült létrehozni az eseményt.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Új esemény"
      breadcrumbs={[
        { label: 'Események', href: '/events' },
        { label: 'Új esemény' },
      ]}
    >
      <Paper sx={{ p: 4 }}>
        <EventForm
          values={values}
          errors={errors}
          isSubmitting={isSubmitting}
          submitLabel="Létrehozás"
          onFieldChange={setField}
          onAddParticipant={addParticipant}
          onRemoveParticipant={removeParticipant}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/events')}
        />
      </Paper>
    </PageLayout>
  );
}
