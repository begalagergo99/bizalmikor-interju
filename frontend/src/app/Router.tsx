import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EventsPage } from '../pages/EventsPage';
import { NewEventPage } from '../pages/NewEventPage';
import { EditEventPage } from '../pages/EditEventPage';

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/events" replace />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/new" element={<NewEventPage />} />
        <Route path="/events/:id/edit" element={<EditEventPage />} />
        <Route path="*" element={<Navigate to="/events" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
