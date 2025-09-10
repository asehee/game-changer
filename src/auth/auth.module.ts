import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionJwtStrategy } from './session-jwt.strategy';
import { SessionJwtGuard } from './session-jwt.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('SESSION_JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('SESSION_JWT_TTL_SEC', 300)}s`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [SessionJwtStrategy, SessionJwtGuard],
  exports: [JwtModule, SessionJwtGuard],
})
export class AuthModule {}