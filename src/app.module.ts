import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { getDatabaseConfig } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GamesModule } from './games/games.module';
import { PlayModule } from './play/play.module';
import { AssetsModule } from './assets/assets.module';
import { BillingModule } from './billing/billing.module';
import { ChainModule } from './chain/chain.module';
import { DevelopersModule } from './developers/developers.module';
import { CrowdFundingModule } from './crowd-funding/crowd-funding.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    ServeStaticModule.forRoot({
      serveRoot: '/games', 
      rootPath: join(__dirname, '..', 'public'),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    GamesModule,
    PlayModule,
    AssetsModule,
    BillingModule,
    ChainModule,
    DevelopersModule,
    CrowdFundingModule,
  ],
})
export class AppModule {}