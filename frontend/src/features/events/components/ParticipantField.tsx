import { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Chip,
  Typography,
  InputAdornment,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import type { Participant } from '../models/event.types';
import { isValidEmail } from '../utils/eventValidation';

interface ParticipantFieldProps {
  participants: Participant[];
  error?: string;
  onAdd: (email: string) => boolean;
  onRemove: (email: string) => void;
}

export function ParticipantField({ participants, error, onAdd, onRemove }: ParticipantFieldProps) {
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleAdd = () => {
    const email = inputValue.trim();
    if (!email) return;

    if (!isValidEmail(email)) {
      setInputError('Érvénytelen email formátum.');
      return;
    }

    const added = onAdd(email);
    if (!added) {
      setInputError('Ez az email cím már szerepel a listában.');
      return;
    }

    setInputValue('');
    setInputError('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <Box>
      <TextField
        label="Résztvevő email"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setInputError('');
        }}
        onKeyDown={handleKeyDown}
        error={!!inputError || !!error}
        helperText={inputError || error}
        fullWidth
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleAdd} edge="end" aria-label="Email hozzáadása">
                  <AddIcon />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        placeholder="pelda@email.com"
      />

      {participants.length > 0 ? (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
          {participants.map((p) => (
            <Chip
              key={p.email}
              label={p.email}
              onDelete={() => onRemove(p.email)}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Még nincsenek résztvevők hozzáadva.
        </Typography>
      )}
    </Box>
  );
}
