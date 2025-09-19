import { Module } from '@nestjs/common';
import { ChainController } from './chain.controller';
import { ChainService } from './chain.service';
import { UsersModule } from '../users/users.module'; // UsersModule import 추가

@Module({
  imports: [
    UsersModule,
  ],
  controllers: [ChainController],
  providers: [ChainService],
  exports: [ChainService],
})
export class ChainModule {}