import { registerAs } from '@nestjs/config';

export default registerAs('smtp', () => ({
  host: process.env.SMTP_HOST ?? 'localhost',
  port: parseInt(process.env.SMTP_PORT ?? '1025', 10),
  from: process.env.SMTP_FROM ?? 'noreply@bizalmikor.hu',
}));
