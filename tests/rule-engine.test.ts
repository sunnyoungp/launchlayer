import assert from "node:assert/strict";
import test from "node:test";

import { aggregateReadiness, applyGlobalAdaptation, defaultAssessmentInput, evaluateFindings, runAssessment } from "../lib/rule-engine";

test("missing ingredient identity prevents an unqualified Ready status", () => {
  const findings = evaluateFindings(defaultAssessmentInput);
  const japan = aggregateReadiness("JP", findings);
  assert.equal(japan.status, "Insufficient information");
  assert.equal(japan.confidence, "Medium");
  assert.ok(japan.missingInformation.length > 0);
});

test("higher-severity classification risk takes precedence after missing facts are resolved", () => {
  const result = runAssessment({ ...defaultAssessmentInput, retinolIdentityConfirmed: true });
  const eu = result.assessments.find((item) => item.market === "EU");
  assert.equal(eu?.status, "Classification risk");
});

test("global adaptation addresses claim, formula identity, and packaging findings", () => {
  const adapted = applyGlobalAdaptation(defaultAssessmentInput);
  const result = runAssessment(adapted);
  for (const id of ["F-CLM-001", "F-FRM-003", "F-LBL-004"]) {
    assert.equal(result.findings.find((item) => item.id === id)?.status, "Addressed");
  }
  assert.equal(result.assessments.find((item) => item.market === "JP")?.status, "Changes required");
});
