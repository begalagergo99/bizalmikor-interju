import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EmailJobPayload } from '../../queue/models/email-job.types';
import { eventPublishedTemplate } from '../templates/event-published.template';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('smtp.host');
    const port = this.configService.get<number>('smtp.port');
    this.logger.log(`SMTP configured → ${host}:${port}`);
    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('SMTP connection verified successfully');
    } catch (err) {
      this.logger.error(
        `SMTP connection failed: ${(err as Error).message}. Emails will not be sent until SMTP is available.`,
      );
    }
  }

  async sendEventPublishedEmail(payload: EmailJobPayload): Promise<void> {
    const { recipient, event } = payload;

    await this.transporter.sendMail({
      from: this.configService.get<string>('smtp.from'),
      to: recipient,
      subject: `You are invited: ${event.title}`,
      html: eventPublishedTemplate(event),
    });

    this.logger.log(
      `Email sent to ${recipient} for event "${event.title}"`,
    );
  }
}
