import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { Participant } from '../participants/entities/participant.entity';
import { EventsController } from './controllers/events.controller';
import { EventsService } from './services/events.service';
import { EventsRepository } from './repositories/events.repository';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Participant]), QueueModule],
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
})
export class EventsModule {}
