import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from '../queue.constants';
import { EmailJobPayload } from '../models/email-job.types';
import { EmailService } from '../../email/services/email.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<EmailJobPayload>): Promise<void> {
    this.logger.log(
      `Processing email job [${job.id}] → ${job.data.recipient}`,
    );
    try {
      await this.emailService.sendEventPublishedEmail(job.data);
      this.logger.log(`Email job [${job.id}] completed successfully`);
    } catch (err) {
      this.logger.error(
        `Email job [${job.id}] failed for ${job.data.recipient}: ${(err as Error).message}`,
        (err as Error).stack,
      );
      throw err;
    }
  }

  onWorkerError(err: Error): void {
    this.logger.error(`BullMQ worker error: ${err.message}`, err.stack);
  }
}
