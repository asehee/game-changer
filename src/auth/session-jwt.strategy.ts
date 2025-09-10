import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface SessionJwtPayload {
  sid: string;
  uid: string;
  gid: string;
  hb: number;
  iat?: number;
  exp?: number;
}

@Injectable()
export class SessionJwtStrategy extends PassportStrategy(Strategy, 'session-jwt') {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('SESSION_JWT_SECRET'),
    });
  }

  async validate(payload: SessionJwtPayload): Promise<SessionJwtPayload> {
    if (!payload.sid || !payload.uid || !payload.gid) {
      throw new UnauthorizedException('Invalid session token');
    }
    
    return payload;
  }
}