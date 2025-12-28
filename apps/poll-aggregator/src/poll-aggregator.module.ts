import { Module } from '@nestjs/common';
import { PollAggregatorController } from './poll-aggregator.controller';
import { PollAggregatorService } from './poll-aggregator.service';
import { PrismaModule } from '../../../libs/prisma';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [PrismaModule,
    ClientsModule.register([
      {
        name: 'KAFKA_EMITTER',
        transport: Transport.KAFKA,
        options:{
          client: { brokers: ['localhost:9092'] },
        }
      }
    ])
  ],
  controllers: [PollAggregatorController],
  providers: [PollAggregatorService],
})
export class PollAggregatorModule {}
