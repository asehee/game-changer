export declare class StartPlayDto {
    walletAddress: string;
    gameId: string;
}
export declare class StartPlayResponseDto {
    sessionToken: string;
    heartbeatIntervalSec: number;
}
export declare class HeartbeatResponseDto {
    sessionToken: string;
}
