import { Body, Controller, Get, Post } from '@nestjs/common';
import { VotingApiService } from './voting-api.service';

@Controller()
export class VotingApiController {
  constructor(private readonly votingApiService: VotingApiService) {}
  @Post('vote')
  async castVote(@Body() voteData: { pollId: string; optionId: string; userId: string }) {
    return this.votingApiService.castVote(voteData.pollId, voteData.optionId, voteData.userId);
  }
}
