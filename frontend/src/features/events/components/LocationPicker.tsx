import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';

const DEFAULT_CENTER: [number, number] = [47.49791, 19.04024];
const DEFAULT_ZOOM = 13;
const SELECTED_ZOOM = 17;

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onSelect: (selection: {
    label: string;
    latitude: number;
    longitude: number;
  }) => void;
}

interface ReverseGeocodeResponse {
  display_name?: string;
  address?: Record<string, string | undefined>;
}

function buildLocationLabel(payload: ReverseGeocodeResponse): string {
  const address = payload.address ?? {};
  const primaryCandidates = [
    address.amenity,
    address.building,
    [address.road, address.house_number].filter(Boolean).join(' ').trim(),
    address.pedestrian,
    address.neighbourhood,
    address.suburb,
  ].filter((value): value is string => Boolean(value));

  const locality = [
    address.city,
    address.town,
    address.village,
    address.municipality,
  ].find(Boolean);

  const primary = primaryCandidates[0];
  if (primary) {
    return locality ? `${primary} (${locality})` : primary;
  }

  return payload.display_name?.split(',').slice(0, 2).join(', ').trim() ?? '';
}

async function reverseGeocode(latitude: number, longitude: number): Promise<string> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', latitude.toString());
  url.searchParams.set('lon', longitude.toString());
  url.searchParams.set('zoom', '18');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', 'hu');

  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error('Nem sikerült lekérni a címadatokat a térképhez.');
  }

  const payload = (await response.json()) as ReverseGeocodeResponse;
  const label = buildLocationLabel(payload);

  if (!label) {
    throw new Error('A kiválasztott ponthoz nem található használható cím.');
  }

  return label;
}

function RecenterMap({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (latitude === null || longitude === null) {
      return;
    }

    map.flyTo([latitude, longitude], SELECTED_ZOOM, { duration: 0.4 });
  }, [latitude, longitude, map]);

  return null;
}

function SelectionLayer({
  latitude,
  longitude,
  onPick,
}: {
  latitude: number | null;
  longitude: number | null;
  onPick: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onPick(event.latlng.lat, event.latlng.lng);
    },
  });

  if (latitude === null || longitude === null) {
    return null;
  }

  return (
    <CircleMarker
      center={[latitude, longitude]}
      radius={10}
      pathOptions={{
        color: '#b42318',
        fillColor: '#f04438',
        fillOpacity: 0.9,
      }}
    />
  );
}

export function LocationPicker({
  latitude,
  longitude,
  onSelect,
}: LocationPickerProps) {
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const center = useMemo<[number, number]>(
    () =>
      latitude === null || longitude === null
        ? DEFAULT_CENTER
        : [latitude, longitude],
    [latitude, longitude],
  );

  const handlePick = async (nextLatitude: number, nextLongitude: number) => {
    setIsResolving(true);
    setError(null);

    try {
      const label = await reverseGeocode(nextLatitude, nextLongitude);
      onSelect({
        label,
        latitude: Number(nextLatitude.toFixed(5)),
        longitude: Number(nextLongitude.toFixed(5)),
      });
    } catch (selectionError) {
      setError(
        selectionError instanceof Error
          ? selectionError.message
          : 'Nem sikerült kiválasztani a helyszínt.',
      );
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <Stack spacing={1.5}>
      <Paper variant="outlined" sx={{ overflow: 'hidden', borderRadius: 3 }}>
        <Box sx={{ height: 320 }}>
          <MapContainer
            center={center}
            zoom={latitude === null || longitude === null ? DEFAULT_ZOOM : SELECTED_ZOOM}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap latitude={latitude} longitude={longitude} />
            <SelectionLayer
              latitude={latitude}
              longitude={longitude}
              onPick={handlePick}
            />
          </MapContainer>
        </Box>
      </Paper>

      <Stack direction="row" spacing={1.5} alignItems="center">
        {isResolving && <CircularProgress size={18} />}
        <Typography variant="body2" color="text.secondary">
          Kattints a térképre a helyszín kiválasztásához. A rendszer a ponthoz
          legközelebbi utca- vagy épületnevet menti el.
        </Typography>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}
    </Stack>
  );
}
