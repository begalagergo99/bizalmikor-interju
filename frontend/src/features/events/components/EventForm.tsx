import { Box, TextField, Button, Stack, Grid } from '@mui/material';
import type { EventFormValues } from '../form/useEventForm';
import type { FormErrors } from '../utils/eventValidation';
import { ParticipantField } from './ParticipantField';
import { toDatetimeLocal, fromDatetimeLocal } from '../utils/eventValidation';
import { LocationPicker } from './LocationPicker';

interface EventFormProps {
  values: EventFormValues;
  errors: FormErrors;
  isSubmitting: boolean;
  submitLabel?: string;
  onFieldChange: <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => void;
  onAddParticipant: (email: string) => boolean;
  onRemoveParticipant: (email: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function EventForm({
  values,
  errors,
  isSubmitting,
  submitLabel = 'Mentés',
  onFieldChange,
  onAddParticipant,
  onRemoveParticipant,
  onSubmit,
  onCancel,
}: EventFormProps) {
  return (
    <Box
      component="form"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <Grid container spacing={3}>
        <Grid size={12}>
          <TextField
            label="Esemény neve"
            value={values.title}
            onChange={(e) => onFieldChange('title', e.target.value)}
            error={!!errors.title}
            helperText={errors.title}
            fullWidth
            required
          />
        </Grid>

        <Grid size={12}>
          <TextField
            label="Kiválasztott helyszín"
            value={values.location}
            error={!!errors.location}
            helperText={errors.location}
            fullWidth
            required
            slotProps={{
              input: { readOnly: true },
            }}
            placeholder="Kattints a térképre egy helyszín kiválasztásához"
          />
        </Grid>

        <Grid size={12}>
          <LocationPicker
            latitude={values.latitude}
            longitude={values.longitude}
            onSelect={({ label, latitude, longitude }) => {
              onFieldChange('location', label);
              onFieldChange('latitude', latitude);
              onFieldChange('longitude', longitude);
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Kezdési időpont"
            type="datetime-local"
            value={toDatetimeLocal(values.startsAt)}
            onChange={(e) => onFieldChange('startsAt', fromDatetimeLocal(e.target.value))}
            error={!!errors.startsAt}
            helperText={errors.startsAt}
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Befejezési időpont"
            type="datetime-local"
            value={toDatetimeLocal(values.endsAt)}
            onChange={(e) => onFieldChange('endsAt', fromDatetimeLocal(e.target.value))}
            error={!!errors.endsAt}
            helperText={errors.endsAt}
            fullWidth
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>

        <Grid size={12}>
          <ParticipantField
            participants={values.participants}
            error={errors.participants}
            onAdd={onAddParticipant}
            onRemove={onRemoveParticipant}
          />
        </Grid>

        <Grid size={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" onClick={onCancel} disabled={isSubmitting}>
              Mégse
            </Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {submitLabel}
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
