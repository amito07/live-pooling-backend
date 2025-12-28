import { Module } from '@nestjs/common';
import { VotingApiController } from './voting-api.controller';
import { VotingApiService } from './voting-api.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PrismaModule } from '../../../libs/prisma';

@Module({
  imports: [
    PrismaModule,
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',
        transport: Transport.KAFKA,
        options: {
          client: {
            brokers: [process.env.KAFKA_BROKERS || 'localhost:9092'],
          },
          consumer: {
            groupId: 'voting-consumer',
          },
        },
      },
    ]),
  ],
  controllers: [VotingApiController],
  providers: [VotingApiService],
})
export class VotingApiModule {}
