import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrowdFunding } from './crowd-funding.entity';
import { Escrow } from './escrow.entity';
import { Game } from '../games/game.entity';
import { CrowdFundingService } from './crowd-funding.service';
import { CrowdFundingController } from './crowd-funding.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CrowdFunding, Escrow, Game])
  ],
  controllers: [CrowdFundingController],
  providers: [CrowdFundingService],
  exports: [CrowdFundingService],
})
export class CrowdFundingModule {}