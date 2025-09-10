import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
export interface SessionJwtPayload {
    sid: string;
    uid: string;
    gid: string;
    hb: number;
    iat?: number;
    exp?: number;
}
declare const SessionJwtStrategy_base: new (...args: any[]) => Strategy;
export declare class SessionJwtStrategy extends SessionJwtStrategy_base {
    private configService;
    constructor(configService: ConfigService);
    validate(payload: SessionJwtPayload): Promise<SessionJwtPayload>;
}
export {};
