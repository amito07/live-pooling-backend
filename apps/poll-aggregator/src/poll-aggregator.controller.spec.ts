import { Test, TestingModule } from '@nestjs/testing';
import { PollAggregatorController } from './poll-aggregator.controller';
import { PollAggregatorService } from './poll-aggregator.service';

describe('PollAggregatorController', () => {
  let pollAggregatorController: PollAggregatorController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [PollAggregatorController],
      providers: [PollAggregatorService],
    }).compile();

    pollAggregatorController = app.get<PollAggregatorController>(PollAggregatorController);
  });
});
