import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EMAIL_QUEUE } from './queue.constants';
import { EmailProducer } from './producers/email.producer';
import { EmailProcessor } from './processors/email.processor';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [BullModule.registerQueue({ name: EMAIL_QUEUE }), EmailModule],
  providers: [EmailProducer, EmailProcessor],
  exports: [EmailProducer],
})
export class QueueModule {}
