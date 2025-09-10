import { BillingStatus } from '../common/enums/billing-status.enum';
export declare class BillingService {
    private readonly logger;
    private simulateFailure;
    check(userId: string): Promise<BillingStatus>;
    checkStream(sessionId: string): Promise<BillingStatus>;
    setSimulateFailure(shouldFail: boolean): void;
    startBillingStream(sessionId: string, userId: string): Promise<void>;
    stopBillingStream(sessionId: string): Promise<void>;
}
