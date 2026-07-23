import type { CaseId, RcmCase, StageId } from '@/lib/types';
import { ascCase } from './asc';
import { behavioralHealthCase } from './behavioral-health';
import { inpatientCase } from './inpatient';
import { oncologyCase } from './oncology';

export const cases: Record<CaseId, RcmCase> = {
  oncology: oncologyCase,
  inpatient: inpatientCase,
  asc: ascCase,
  behavioralHealth: behavioralHealthCase,
};

export const caseList: RcmCase[] = [oncologyCase, inpatientCase, ascCase, behavioralHealthCase];

export function getCase(id: string): RcmCase | undefined {
  return (cases as Record<string, RcmCase>)[id];
}

export const STAGE_ORDER: StageId[] = [
  'registration',
  'eligibility',
  'priorAuth',
  'cdi',
  'charge',
  'coding',
  'claim',
  'denial',
  'payment',
];

export const STAGE_NUMBER: Record<StageId, string> = {
  registration: '01',
  eligibility: '02',
  priorAuth: '03',
  cdi: '04',
  charge: '05',
  coding: '06',
  claim: '07',
  denial: '08',
  payment: '09',
};

export const STAGE_TITLE: Record<StageId, string> = {
  registration: 'Patient Registration',
  eligibility: 'Eligibility Verification',
  priorAuth: 'Prior Authorization',
  cdi: 'Clinical Documentation',
  charge: 'Charge Capture',
  coding: 'Coding & Billing',
  claim: 'Claims Submission',
  denial: 'Denial Management',
  payment: 'Payment & Collections',
};

/** Roll-up KPIs across the 4 cases for the landing dashboard. */
export function rollupKpis() {
  const totalBilled = caseList.reduce((s, c) => s + c.kpis.totalBilled, 0);
  const totalPaid = caseList.reduce(
    (s, c) => s + c.kpis.payerPayment + (c.kpis.appealRecovered ? 0 : 0),
    0,
  );
  const denials = caseList.flatMap((c) => c.denials);
  const overturned = denials.filter((d) => d.recovered > 0).length;
  const cleanClaim =
    caseList.reduce((s, c) => s + c.kpis.cleanClaimRate, 0) / caseList.length;
  const avgDays =
    caseList.reduce((s, c) => s + c.kpis.daysToPayment, 0) / caseList.length;
  return {
    totalBilled,
    totalPaid,
    cleanClaimRate: cleanClaim,
    avgDaysToPayment: avgDays,
    denialOverturnRate: denials.length === 0 ? 1 : overturned / denials.length,
    netCollectionRate:
      caseList.reduce((s, c) => s + (c.kpis.netCollectionRate ?? 0), 0) /
      caseList.length,
  };
}
