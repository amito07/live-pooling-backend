import { Test, TestingModule } from '@nestjs/testing';
import { VotingApiController } from './voting-api.controller';
import { VotingApiService } from './voting-api.service';

describe('VotingApiController', () => {
  let votingApiController: VotingApiController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [VotingApiController],
      providers: [VotingApiService],
    }).compile();

    votingApiController = app.get<VotingApiController>(VotingApiController);
  });
});
