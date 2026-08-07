// lib/constants.ts

// 👑 APP MANAGER COMMISSION CONFIGURATION
export const PLATFORM_COMMISSION_PERCENT = 2.0; // 2.0% deducted for App Manager

// 💵 JOB POSTING FEE (For Employers)
export const JOB_POSTING_FEE_USD = 20.0; // $20 flat fee to post a job

// 📱 DEFAULT CURRENCY
export const DEFAULT_CURRENCY = 'USD';

// 📊 EARNINGS SPLIT CALCULATOR HELPER
export function calculateEarningsSplit(grossAmount: number) {
  const commissionRate = PLATFORM_COMMISSION_PERCENT / 100; // 0.02
  const managerCommission = grossAmount * commissionRate;   // 2% for App Manager
  const jobTakerPayout = grossAmount - managerCommission;   // 98% for Job-Taker

  return {
    grossAmount,
    managerCommission, // E.g., $20 on a $1,000 job
    jobTakerPayout,     // E.g., $980 on a $1,000 job
  };
}