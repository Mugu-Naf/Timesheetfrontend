export interface OvertimeRule {
  overtimeRuleId: number;
  ruleName: string;
  maxRegularHours: number;
  overtimeMultiplier: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
}

export interface OvertimeRuleCreateRequest {
  ruleName: string;
  maxRegularHours: number;
  overtimeMultiplier: number;
  effectiveFrom: string;
  effectiveTo?: string;
}

export interface OvertimeRuleUpdateRequest {
  ruleName: string;
  maxRegularHours: number;
  overtimeMultiplier: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}
