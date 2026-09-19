# LaunchLayer hackathon MVP

LaunchLayer is a source-backed cosmetics market-readiness workspace for leave-on facial skincare across the United States, European Union, and Japan. This repository implements the seeded Lumière Renewal Serum demonstration and a market-first new-product planner.

> All regulatory rules, findings, dates, and outcomes in the application are labeled demonstration data. LaunchLayer does not provide legal advice, government approval, certification, or a guarantee of compliance.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server (normally `http://localhost:5173`). No credentials are required for the MVP. The local Sites identity simulator uses `seedy@sites.test` when the optional sign-in route is exercised; the visible seeded workspace owner is a fictional demo identity.

## Demo paths

- **Products** is the portfolio landing screen for opening a product, assessing an existing one, or planning a new one.
- **Product workspace** keeps Overview, Markets, Formula, Claims & Packaging, Launch Plan, and Activity together for one Product Passport.
- **Plan new product** begins with target-market selection, then produces available claims, mandatory packaging, design constraints, and ingredient-choice guidance.
- **Markets** shows source-backed findings, actions, confidence, consequences, and the minimum-change path across the US, EU, and Japan.
- **Regulatory updates** and **Source library** provide the seeded demonstration reference layer.

## Architecture

- Next.js-compatible App Router UI powered by Vinext, React, and TypeScript
- Accessible React controls for navigation, tabs, selects, checkboxes, and form controls
- Structured Product Passport, finding, market, claim, and source types in `lib/product-model.ts`
- Versioned demonstration facts and sources in the product model; conclusions are evaluated from structured inputs
- Deterministic claim evaluation, readiness aggregation, and minimum-change planning in `lib/product-model.ts`
- Drizzle/SQLite relational schema and generated migration under `db/` and `drizzle/`
- Local D1-backed workspace persistence through `/api/workspace`

The deployed-data shape anticipates workspace isolation, Product Passport versions, normalized ingredients, sources/rules, assessments/findings, launch plans/tasks, and audit events. The hackathon interface intentionally uses in-memory state so reviewers can reset and replay the complete flow without a backend dependency.

## Data model

The included schema covers `Workspace`, `User`, `Membership`, `Product`, `ProductVersion`, `FormulaIngredient`, `RegulatorySource`, `Rule`, `Assessment`, `Finding`, `LaunchPlan`, `Task`, and `AuditEvent`. Formula facts and finding triggers are version-scoped. Common workspace, product-version, assessment-market, finding-status, and task-status lookups are indexed.

Generate and seed a local reference database:

```bash
npm run db:generate
npm run db:seed-demo
```

The local preview reads the `demo_workspace` record through `/api/workspace`; the broader relational tables remain the migration-ready persistence handoff for a production implementation.

## Checks

```bash
npm test
npm run lint
npm run build
```

The tests cover rule precedence, missing-information confidence, deterministic recalculation, the existing-product demonstration path, and the core new-product brief outputs.

## Material assumptions

- The hackathon vertical slice is local and single-workspace; authentication and durable multi-tenant writes are represented in the schema but are outside this demo.
- Upload controls accept the requested file types but parsing is represented by editable seeded extraction results. Production parsing, signed object storage, OCR, retryable jobs, and malware scanning remain integration work.
- Regulatory records are deliberately small, versioned seed examples based on named primary-source families. They are not comprehensive legal research or live monitoring.
- Readiness is rule-based. Missing ingredient identity returns unknown information and prevents an unqualified Ready status; AI-style explanatory behavior never changes a rule result.
- Relative effort is shown instead of invented cost or timeline estimates.
- “Markets in reach” means no remaining seeded substantive product-change finding in the demo; administrative steps and final validation still apply.

## Deferred production work

- Full authentication and authorization enforcement for owner/editor/viewer roles
- D1/PostgreSQL runtime persistence, R2/object storage, signed files, and document-processing jobs
- Comprehensive licensed regulatory data, legal review, and live update ingestion
- Government portal submission, translation certification, cost estimation, billing, and enterprise SSO
- Broader countries, categories, and ingredient/rule coverage
