import { Controller, Inject } from '@nestjs/common';
import { ClientKafka, EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../../../libs/prisma';

@Controller()
export class PollAggregatorController {
  private voteBuffer: Map<string, number> = new Map();
  
  constructor(private readonly prisma: PrismaService,
    @Inject('KAFKA_EMITTER') private readonly kafkaClient: ClientKafka
  ) {
    console.log("Aggregator: Timer started...");
    // Start the "Flush" interval
    setInterval(() => this.flushVotes(), 2000); // Flush every 2 seconds
  }

  async onModuleInit() {
    console.log("Aggregator: Connecting to Kafka Producer...");
    await this.kafkaClient.connect();
    console.log("Aggregator: Connected!");
  }

  @EventPattern('raw-votes')
  handleVote(@Payload() data: any) {
    console.log("Aggregator: Received Vote!", data);
    const { optionId } = data;

    if (!optionId) {
      console.error("Aggregator: ERROR - No optionId found in payload", data);
      return;
    }
    
    // Increment memory buffer
    const current = this.voteBuffer.get(optionId) || 0;
    this.voteBuffer.set(optionId, current + 1);
    console.log(`Aggregator: Buffer for ${optionId} is now ${current + 1}`);
    
    // Note: We do NOT write to DB here.
  }

  async flushVotes() {
      if (this.voteBuffer.size === 0) return;

      console.log(`[Batch] Flushing ${this.voteBuffer.size} options...`);
      const updates = Array.from(this.voteBuffer.entries());
      this.voteBuffer.clear();

      for (const [optionId, count] of updates) {
        try {
                  // 1. Update DB (Atomic Increment)
        console.log(`Aggregator: Writing to DB -> Option: ${optionId}, Count: ${count}`);
        const updatedOption = await this.prisma.option.update({
          where: { id: optionId },
          data: { votes: { increment: count } },
        });

        console.log(`Aggregator: Emitting poll-updates -> ${updatedOption.votes}`);

        // 2. Broadcast New Total to Kafka
        // Topic: poll-updates
        this.kafkaClient.emit('poll-updates', {
          optionId: updatedOption.id,
          pollId: updatedOption.pollId,
          newCount: updatedOption.votes,
        });
          
        } catch (error) {
          console.error("Aggregator: DB Write Failed!", error);
          
        }
      }
    }
}