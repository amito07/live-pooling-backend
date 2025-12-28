import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { VotingApiModule } from './voting-api.module';

async function bootstrap() {
  const app = await NestFactory.create(VotingApiModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
