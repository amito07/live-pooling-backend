import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { RealtimeServiceModule } from './realtime-service.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(RealtimeServiceModule);
    app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'dashboard-consumer-group', // Distinct Group ID
      },
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.port ?? 3002);
  console.log('Dashboard Backend is running on port 3002');
}
bootstrap();
