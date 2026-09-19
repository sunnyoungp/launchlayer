export type MarketCode = "US" | "EU" | "JP";
export type ReadinessStatus =
  | "Ready based on reviewed information"
  | "Ready after administrative actions"
  | "Changes required"
  | "Reformulation required"
  | "Classification risk"
  | "Insufficient information"
  | "Hold";

export type Finding = {
  id: string;
  title: string;
  market: MarketCode;
  dimension: string;
  requirementType: "Legal requirement" | "Conditional requirement" | "Industry expectation" | "Recommendation";
  severity: "Blocker" | "Major" | "Moderate" | "Informational";
  status: "Open" | "Addressed";
  explanation: string;
  trigger: string;
  action: string;
  sourceId: string;
  provision: string;
  effectiveDate: string;
  reviewedDate: string;
  confidence: "High" | "Medium" | "Low";
  affectedMarkets: MarketCode[];
};

export type RegulatorySource = {
  id: string;
  jurisdiction: MarketCode;
  authority: string;
  title: string;
  url: string;
  effectiveDate: string;
  reviewedDate: string;
  version: string;
};

export type AssessmentInput = {
  repairClaim: boolean;
  clinicalClaimEvidence: boolean;
  retinolIdentityConfirmed: boolean;
  euResponsiblePerson: boolean;
  japanResponsibleParty: boolean;
  euNominalContents: boolean;
};

export type CountryAssessment = {
  market: MarketCode;
  status: ReadinessStatus;
  confidence: "High" | "Medium" | "Low";
  findingIds: string[];
  missingInformation: string[];
};
