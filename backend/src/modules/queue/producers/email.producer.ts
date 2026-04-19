import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE, EMAIL_JOB_SEND_EVENT_PUBLISHED } from '../queue.constants';
import { EmailJobPayload, EventEmailData } from '../models/email-job.types';

@Injectable()
export class EmailProducer {
  constructor(
    @InjectQueue(EMAIL_QUEUE)
    private readonly emailQueue: Queue<EmailJobPayload>,
  ) {}

  async enqueueEventPublishedEmails(
    recipients: string[],
    event: EventEmailData,
  ): Promise<void> {
    const jobs = recipients.map((recipient) => ({
      name: EMAIL_JOB_SEND_EVENT_PUBLISHED,
      data: { recipient, event } satisfies EmailJobPayload,
      opts: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5000 },
      },
    }));

    await this.emailQueue.addBulk(jobs);
  }
}
