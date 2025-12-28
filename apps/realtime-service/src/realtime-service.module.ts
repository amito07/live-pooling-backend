import { Module } from '@nestjs/common';
import { RealtimeServiceController } from './realtime-service.controller';
import { RealtimeServiceService } from './realtime-service.service';
import { PrismaModule } from '../../../libs/prisma';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [PrismaModule],
  controllers: [RealtimeServiceController],
  providers: [RealtimeServiceService, EventsGateway],
})
export class RealtimeServiceModule {}
