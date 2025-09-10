"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BillingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingService = void 0;
const common_1 = require("@nestjs/common");
const billing_status_enum_1 = require("../common/enums/billing-status.enum");
let BillingService = BillingService_1 = class BillingService {
    constructor() {
        this.logger = new common_1.Logger(BillingService_1.name);
        this.simulateFailure = false;
    }
    async check(userId) {
        this.logger.log(`Checking billing status for user ${userId}`);
        if (this.simulateFailure) {
            return billing_status_enum_1.BillingStatus.INSUFFICIENT;
        }
        return billing_status_enum_1.BillingStatus.OK;
    }
    async checkStream(sessionId) {
        this.logger.log(`Checking stream billing status for session ${sessionId}`);
        if (this.simulateFailure) {
            return billing_status_enum_1.BillingStatus.STOPPED;
        }
        return billing_status_enum_1.BillingStatus.OK;
    }
    setSimulateFailure(shouldFail) {
        this.simulateFailure = shouldFail;
        this.logger.warn(`Billing failure simulation set to: ${shouldFail}`);
    }
    async startBillingStream(sessionId, userId) {
        this.logger.log(`Starting billing stream for session ${sessionId}, user ${userId}`);
    }
    async stopBillingStream(sessionId) {
        this.logger.log(`Stopping billing stream for session ${sessionId}`);
    }
};
exports.BillingService = BillingService;
exports.BillingService = BillingService = BillingService_1 = __decorate([
    (0, common_1.Injectable)()
], BillingService);
//# sourceMappingURL=billing.service.js.map