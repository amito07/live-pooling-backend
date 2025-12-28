import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { PollAggregatorModule } from './poll-aggregator.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(PollAggregatorModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'poll-aggregator-group', // Distinct Consumer Group
      },
      // IMPORTANT: Ensure we read messages from the start if we missed any
      subscribe: {
        fromBeginning: true,
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3001);
  console.log('Poll Aggregator is running...');
}
bootstrap();
