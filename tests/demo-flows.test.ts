import assert from "node:assert/strict";
import test from "node:test";

import { claimMenu, packagingBlueprint } from "../lib/seed-data";
import { applyGlobalAdaptation, defaultAssessmentInput, runAssessment } from "../lib/rule-engine";

test("existing-product demonstration runs from intake through recalculation", () => {
  const initial = runAssessment(defaultAssessmentInput);
  assert.equal(initial.assessments.length, 3);
  assert.ok(initial.findings.every((finding) => finding.sourceId && finding.action && finding.confidence));
  const revised = runAssessment(applyGlobalAdaptation(defaultAssessmentInput));
  assert.ok(revised.findings.filter((finding) => finding.status === "Open").length < initial.findings.filter((finding) => finding.status === "Open").length);
});

test("new-product market-first brief contains all core outputs", () => {
  assert.ok(claimMenu.some((item) => item.status === "Classification risk"));
  assert.ok(claimMenu.some((item) => item.status === "Evidence required"));
  assert.ok(packagingBlueprint.every((row) => row.US && row.EU && row.JP));
  assert.ok(packagingBlueprint.some((row) => row.field.includes("Responsible party")));
});
