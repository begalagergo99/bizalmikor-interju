import { EventEmailData } from '../../queue/models/email-job.types';

export function eventPublishedTemplate(data: EventEmailData): string {
  const starts = new Date(data.startsAt).toLocaleString('hu-HU', {
    timeZone: 'Europe/Budapest',
  });
  const ends = new Date(data.endsAt).toLocaleString('hu-HU', {
    timeZone: 'Europe/Budapest',
  });

  return `
    <!DOCTYPE html>
    <html lang="hu">
      <head><meta charset="UTF-8" /></head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2>You are invited: ${data.title}</h2>
        <p>The following event has just been published and you are registered as a participant:</p>
        <table style="border-collapse: collapse; width: 100%; max-width: 480px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; width: 120px;">Event</td>
            <td style="padding: 8px;">${data.title}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">Location</td>
            <td style="padding: 8px;">${data.location}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold;">Starts</td>
            <td style="padding: 8px;">${starts}</td>
          </tr>
          <tr style="background: #f9f9f9;">
            <td style="padding: 8px; font-weight: bold;">Ends</td>
            <td style="padding: 8px;">${ends}</td>
          </tr>
        </table>
        <p style="margin-top: 24px;">We look forward to seeing you there!</p>
      </body>
    </html>
  `;
}
