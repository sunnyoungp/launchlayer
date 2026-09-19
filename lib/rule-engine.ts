import { baseFindings } from "./seed-data";
import type { AssessmentInput, CountryAssessment, Finding, MarketCode, ReadinessStatus } from "./launchlayer-types";

export const defaultAssessmentInput: AssessmentInput = {
  repairClaim: true,
  clinicalClaimEvidence: false,
  retinolIdentityConfirmed: false,
  euResponsiblePerson: false,
  japanResponsibleParty: false,
  euNominalContents: false,
};

export function evaluateFindings(input: AssessmentInput): Finding[] {
  return baseFindings.map((finding) => {
    const addressed =
      (finding.id === "F-CLM-001" && !input.repairClaim) ||
      (finding.id === "F-CLM-002" && input.clinicalClaimEvidence) ||
      (finding.id === "F-FRM-003" && input.retinolIdentityConfirmed) ||
      (finding.id === "F-LBL-004" && input.euNominalContents) ||
      (finding.id === "F-OPS-005" && input.euResponsiblePerson) ||
      (finding.id === "F-OPS-006" && input.japanResponsibleParty);
    return { ...finding, status: addressed ? "Addressed" : "Open" };
  });
}

const precedence: ReadinessStatus[] = ["Hold", "Insufficient information", "Classification risk", "Reformulation required", "Changes required", "Ready after administrative actions", "Ready based on reviewed information"];

export function aggregateReadiness(market: MarketCode, findings: Finding[]): CountryAssessment {
  const open = findings.filter((finding) => finding.status === "Open" && finding.affectedMarkets.includes(market));
  const missingInformation = open.filter((finding) => finding.id === "F-FRM-003").map(() => "Standardized retinol identity and active concentration");
  let status: ReadinessStatus = "Ready based on reviewed information";
  if (missingInformation.length) status = "Insufficient information";
  else if (open.some((finding) => finding.dimension === "Classification")) status = "Classification risk";
  else if (open.some((finding) => finding.dimension !== "Market entry")) status = "Changes required";
  else if (open.some((finding) => finding.dimension === "Market entry")) status = "Ready after administrative actions";
  return { market, status, confidence: missingInformation.length ? "Medium" : "High", findingIds: open.map((finding) => finding.id), missingInformation };
}

export function runAssessment(input: AssessmentInput) {
  const findings = evaluateFindings(input);
  const assessments = (["US", "EU", "JP"] as MarketCode[]).map((market) => aggregateReadiness(market, findings));
  return { findings, assessments: assessments.sort((a, b) => precedence.indexOf(a.status) - precedence.indexOf(b.status)) };
}

export function applyGlobalAdaptation(input: AssessmentInput): AssessmentInput {
  return { ...input, repairClaim: false, retinolIdentityConfirmed: true, euNominalContents: true };
}
