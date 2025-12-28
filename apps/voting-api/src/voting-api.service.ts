import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import Redis from 'ioredis';

@Injectable()
export class VotingApiService {
  private redis = new Redis({host: 'localhost', port: 6379});

  constructor(
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  async onModuleInit() {
    this.kafkaClient.subscribeToResponseOf('raw-votes');
    await this.kafkaClient.connect();
  }

  async castVote(pollId: string, optionId: string, userId: string) {
      // 1. Idempotency Check (Redis)
      // Key: vote:poll_123:user_abc
      const hasVoted = await this.redis.get(`vote:${pollId}:${userId}`);
      if (hasVoted) {
        throw new BadRequestException('You have already voted!');
      }

      // 2. Push to Kafka (The "Write-Behind" pattern)
      // We key by 'pollId' so all votes for this poll go to the same partition.
      const result = await this.kafkaClient.emit('raw-votes', {
        key: pollId, 
        value: { pollId, optionId, userId } // timestamp added auto
      });

      console.log('Vote emitted to Kafka:', result);



      // 3. Mark as voted in Redis (Expire in 1 hour)
      console.log('Setting Redis key for vote:', `vote:${pollId}:${userId}`);
      await this.redis.set(`vote:${pollId}:${userId}`, '1', 'EX', 3600);

      return { status: 'Vote queued' };
    }
    
}
