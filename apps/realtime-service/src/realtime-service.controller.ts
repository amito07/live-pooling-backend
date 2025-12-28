import { Controller, Get } from '@nestjs/common';
import { RealtimeServiceService } from './realtime-service.service';
import { EventsGateway } from './events.gateway';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class RealtimeServiceController {
  constructor(private readonly realtimeServiceService: RealtimeServiceService,
    private readonly eventsGateway: EventsGateway
  ) {}

  @EventPattern('poll-updates')
  handlePollUpdate(@Payload() data: any) {
    console.log(`[WS] Broadcasting update for Option ${data.optionId}: ${data.newCount}`);
    
    // Broadcast to everyone watching this specific poll
    // Event Name: 'poll-stats'
    this.eventsGateway.server.emit('poll-stats', data);
  }
}
