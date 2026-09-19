import type { Finding, RegulatorySource } from "./launchlayer-types";

export const marketNames = { US: "United States", EU: "European Union", JP: "Japan" } as const;

export const sources: RegulatorySource[] = [
  { id: "SRC-US-01", jurisdiction: "US", authority: "U.S. Food & Drug Administration", title: "Cosmetics & U.S. Law", url: "https://www.fda.gov/cosmetics/cosmetics-laws-regulations/cosmetics-us-law", effectiveDate: "2022-12-29", reviewedDate: "2026-09-01", version: "2026.09-demo" },
  { id: "SRC-US-02", jurisdiction: "US", authority: "U.S. Food & Drug Administration", title: "Is It a Cosmetic, a Drug, or Both?", url: "https://www.fda.gov/cosmetics/cosmetics-laws-regulations/it-cosmetic-drug-or-both-or-it-soap", effectiveDate: "2022-12-29", reviewedDate: "2026-09-01", version: "2026.09-demo" },
  { id: "SRC-EU-01", jurisdiction: "EU", authority: "European Parliament and Council", title: "Regulation (EC) No 1223/2009 on cosmetic products", url: "https://eur-lex.europa.eu/eli/reg/2009/1223/oj", effectiveDate: "2013-07-11", reviewedDate: "2026-09-01", version: "consolidated-demo" },
  { id: "SRC-EU-02", jurisdiction: "EU", authority: "European Commission", title: "Regulation (EU) No 655/2013 — common criteria for cosmetic claims", url: "https://eur-lex.europa.eu/eli/reg/2013/655/oj", effectiveDate: "2013-07-11", reviewedDate: "2026-09-01", version: "2013-demo" },
  { id: "SRC-JP-01", jurisdiction: "JP", authority: "Ministry of Health, Labour and Welfare", title: "Standards for Cosmetics", url: "https://www.mhlw.go.jp/english/dl/cosmetics.pdf", effectiveDate: "2000-09-29", reviewedDate: "2026-09-01", version: "seed-demo" },
  { id: "SRC-JP-02", jurisdiction: "JP", authority: "Ministry of Health, Labour and Welfare", title: "Pharmaceuticals and Medical Devices Act — cosmetics pathway overview", url: "https://www.mhlw.go.jp/english/policy/health-medical/pharmaceuticals/index.html", effectiveDate: "2014-11-25", reviewedDate: "2026-09-01", version: "seed-demo" },
];

export const baseFindings: Finding[] = [
  { id: "F-CLM-001", title: "“Repairs damaged skin” may imply therapeutic action", market: "EU", dimension: "Classification", requirementType: "Conditional requirement", severity: "Blocker", status: "Open", explanation: "The repair language may be understood as restoring a damaged physiological function rather than maintaining skin appearance.", trigger: "Draft front-panel claim: Repairs damaged skin", action: "Replace with appearance-focused wording and review the complete presentation in context.", sourceId: "SRC-EU-02", provision: "Annex — legal compliance and truthfulness criteria", effectiveDate: "2013-07-11", reviewedDate: "2026-09-01", confidence: "High", affectedMarkets: ["US", "EU", "JP"] },
  { id: "F-CLM-002", title: "Clinical wrinkle claim lacks finished-product evidence", market: "US", dimension: "Safety and evidence", requirementType: "Industry expectation", severity: "Major", status: "Open", explanation: "A quantified or clinical performance impression should be supported by evidence for this finished formula, not only ingredient literature.", trigger: "Clinically proven to erase wrinkles", action: "Remove “clinically proven” and “erase,” or link a suitable finished-product study with the tested conditions.", sourceId: "SRC-US-01", provision: "Product claims and safety substantiation", effectiveDate: "2022-12-29", reviewedDate: "2026-09-01", confidence: "High", affectedMarkets: ["US", "EU", "JP"] },
  { id: "F-FRM-003", title: "Retinol identity and concentration need confirmation", market: "JP", dimension: "Formula", requirementType: "Legal requirement", severity: "Major", status: "Open", explanation: "The supplier trade name does not establish the standardized ingredient identity or active concentration needed to evaluate market-specific restrictions.", trigger: "Retinol Complex — 0.30% trade blend; active fraction not stated", action: "Obtain the supplier composition and confirm standardized identity plus active retinol concentration.", sourceId: "SRC-JP-01", provision: "Ingredient restrictions and specification review", effectiveDate: "2000-09-29", reviewedDate: "2026-09-01", confidence: "Medium", affectedMarkets: ["EU", "JP"] },
  { id: "F-LBL-004", title: "EU nominal contents field is missing", market: "EU", dimension: "Label and packaging", requirementType: "Legal requirement", severity: "Major", status: "Open", explanation: "The draft outer carton does not show nominal contents in the required label set.", trigger: "Packaging v2 extracted text has no nominal contents field", action: "Add nominal contents to the universal information panel and verify final artwork.", sourceId: "SRC-EU-01", provision: "Article 19(1)(b)", effectiveDate: "2013-07-11", reviewedDate: "2026-09-01", confidence: "High", affectedMarkets: ["EU"] },
  { id: "F-OPS-005", title: "EU Responsible Person and notification are not assigned", market: "EU", dimension: "Market entry", requirementType: "Legal requirement", severity: "Major", status: "Open", explanation: "The product file does not identify an EU Responsible Person or completion of pre-market notification.", trigger: "No EU Responsible Person record; CPNP task not started", action: "Appoint the Responsible Person, complete the product information file, and notify through CPNP before placing on market.", sourceId: "SRC-EU-01", provision: "Articles 4, 11 and 13", effectiveDate: "2013-07-11", reviewedDate: "2026-09-01", confidence: "High", affectedMarkets: ["EU"] },
  { id: "F-OPS-006", title: "Japan local market-entry party is not confirmed", market: "JP", dimension: "Market entry", requirementType: "Legal requirement", severity: "Major", status: "Open", explanation: "The demonstration passport has no confirmed local party for the intended Japan pathway.", trigger: "Local responsible party field is blank", action: "Confirm the licensed local party and product pathway before finalizing the Japan launch plan.", sourceId: "SRC-JP-02", provision: "Cosmetics market-entry pathway overview", effectiveDate: "2014-11-25", reviewedDate: "2026-09-01", confidence: "Medium", affectedMarkets: ["JP"] },
];

export const formula = [
  ["Aqua", "Solvent", "72.50%"], ["Glycerin", "Humectant", "8.00%"], ["Niacinamide", "Skin conditioning", "5.00%"],
  ["Squalane", "Emollient", "4.00%"], ["Retinol Complex", "Skin conditioning", "0.30% blend"], ["Phenoxyethanol", "Preservative", "0.80%"],
];

export const sampleClaims = ["Repairs damaged skin", "Stimulates collagen production", "Clinically proven to erase wrinkles", "Helps skin look smoother", "Supports a brighter-looking complexion"];

export const packagingBlueprint = [
  { field: "Product identity / function", US: "Required", EU: "Required", JP: "Required" },
  { field: "Net contents", US: "Required", EU: "Required", JP: "Required" },
  { field: "Ingredient declaration", US: "Required", EU: "Required", JP: "Required" },
  { field: "Responsible party / local entity", US: "Required", EU: "EU RP", JP: "Local party" },
  { field: "Durability / PAO", US: "Conditional", EU: "Required", JP: "Conditional" },
  { field: "Batch reference", US: "Recommended", EU: "Required", JP: "Required" },
];

export const claimMenu = [
  { claim: "Helps skin look smoother", reach: "US · EU · JP", status: "Usable based on current information", note: "Appearance-focused; keep context cosmetic." },
  { claim: "Supports a brighter-looking complexion", reach: "US · EU · JP", status: "Evidence required", note: "Finished-product support recommended." },
  { claim: "Visibly reduces the look of fine lines", reach: "US · EU · JP", status: "Evidence required", note: "Instrumental or consumer study needed." },
  { claim: "Stimulates collagen production", reach: "Limited", status: "Classification risk", note: "Avoid biological-function implication." },
];
