#!/usr/bin/env node
/* Worked examples that MUST pass — Jake authorized Walmart deal matrix */
var p = require("./pricing.js");
var fails = 0;

function eq(a, b) {
  if (typeof a === "number" && typeof b === "number") return a === b;
  return a === b;
}

function check(name, opts, expect) {
  var got = p.compute(opts);
  var bad = [];
  Object.keys(expect).forEach(function (k) {
    if (!eq(got[k], expect[k])) bad.push(k + ": expected " + expect[k] + " got " + got[k]);
  });
  if (got.multi !== 0) bad.push("multi fee must be 0, got " + got.multi);
  if (bad.length) {
    fails += 1;
    console.log("FAIL  " + name);
    bad.forEach(function (b) { console.log("      " + b); });
  } else {
    console.log("PASS  " + name + "  →  " + p.money(got.total) + " + " + got.pct + "%");
  }
}

check("1. Amazon-only Gold",
  { marketplaces: ["Amazon"], tier: 1 },
  { listBase: 750, dealBase: null, billed: 750, base: 750, dealOn: false, total: 750, pct: 3.5, planLabel: "Gold", litePlan: false });

check("2. Shopify-only Gold",
  { marketplaces: ["Shopify"], tier: 1 },
  { listBase: 350, dealBase: null, billed: 350, base: 350, dealOn: false, total: 350, pct: 4, planLabel: "Shopify-only", shopifyPlan: true, litePlan: true });

check("3. Walmart-only Gold",
  { marketplaces: ["Walmart"], tier: 1 },
  { listBase: 350, dealBase: null, billed: 350, base: 350, dealOn: false, total: 350, pct: 4, planLabel: "Walmart-only", litePlan: true });

check("4. Amazon+Shopify Gold (no Walmart, no deal) $1,100",
  { marketplaces: ["Amazon", "Shopify"], tier: 1 },
  { listBase: 1100, dealBase: null, billed: 1100, base: 1100, dealOn: false, total: 1100, pct: 3.5, planLabel: "Gold", shopifyPlan: false, litePlan: false });

check("5. Amazon+Walmart Gold deal $500 (list $1,100)",
  { marketplaces: ["Amazon", "Walmart"], tier: 1 },
  { listBase: 1100, dealBase: 500, billed: 500, base: 500, dealOn: true, total: 500, pct: 3.5, planLabel: "Gold", waivedThird: 0 });

check("6. Shopify+Walmart Gold deal $500 (list $750)",
  { marketplaces: ["Shopify", "Walmart"], tier: 1 },
  { listBase: 750, dealBase: 500, billed: 500, base: 500, dealOn: true, total: 500, pct: 3.5, litePlan: false, shopifyPlan: false });

check("7. All three Gold deal $600 (list $1,100, third $350 waived)",
  { marketplaces: ["Amazon", "Shopify", "Walmart"], tier: 1 },
  { listBase: 1100, dealBase: 600, billed: 600, base: 600, dealOn: true, total: 600, pct: 3.5, waivedThird: 350 });

check("8. Amazon Enterprise 1 — $1,450, no Walmart deal",
  { marketplaces: ["Amazon"], tier: 2 },
  { listBase: 1450, dealBase: null, billed: 1450, base: 1450, dealOn: false, total: 1450, pct: 2.5, planLabel: "Enterprise 1" });

check("9. Amazon+Walmart Enterprise 1 — Ent rates, no deal",
  { marketplaces: ["Amazon", "Walmart"], tier: 2 },
  { listBase: 1450, dealBase: null, billed: 1450, base: 1450, dealOn: false, total: 1450, pct: 2.5, waivedThird: 0 });

check("10. All three Enterprise 1 — Ent rates, no deal",
  { marketplaces: ["Amazon", "Shopify", "Walmart"], tier: 2 },
  { listBase: 1450, dealBase: null, billed: 1450, dealOn: false, pct: 2.5, planLabel: "Enterprise 1" });

check("11. Shopify-only + Enterprise 1 uses Ent rates",
  { marketplaces: ["Shopify"], tier: 2 },
  { listBase: 1450, billed: 1450, pct: 2.5, shopifyPlan: false, litePlan: false, dealOn: false });

check("12. Geos on billed deal (A+W $500 + 4 geos bundle $300)",
  { marketplaces: ["Amazon", "Walmart"], tier: 1, globalOn: true, geos: ["US", "CA", "DE", "ES"] },
  { listBase: 1100, dealBase: 500, billed: 500, base: 500, global: 300, subtotal: 800, total: 800, pct: 3.5, dealOn: true });

check("13. Annual 15% of billed (A+W deal $500)",
  { marketplaces: ["Amazon", "Walmart"], tier: 1, annual: true },
  { billed: 500, base: 500, subtotal: 500, annualDiscount: 75, total: 425, dealOn: true });

check("14. Annual 15% of billed (all three $600 + 4 geos)",
  { marketplaces: ["Amazon", "Shopify", "Walmart"], tier: 1, globalOn: true, geos: ["US", "CA", "DE", "ES"], annual: true },
  { billed: 600, base: 600, global: 300, subtotal: 900, annualDiscount: 135, total: 765, dealOn: true });

check("15. Amazon Gold + 4 geos (no deal)",
  { marketplaces: ["Amazon"], tier: 1, globalOn: true, geos: ["US", "CA", "DE", "ES"] },
  { billed: 750, base: 750, global: 300, subtotal: 1050, total: 1050, pct: 3.5, dealOn: false });

check("16. Amazon Gold + 4 geos + annual (15% of billed+geos)",
  { marketplaces: ["Amazon"], tier: 1, globalOn: true, geos: ["US", "CA", "DE", "ES"], annual: true },
  { billed: 750, global: 300, subtotal: 1050, annualDiscount: 158, total: 892, pct: 3.5 });

check("17. Amazon+Shopify annual 15% of $1,100",
  { marketplaces: ["Amazon", "Shopify"], tier: 1, annual: true },
  { billed: 1100, dealOn: false, annualDiscount: 165, total: 935 });

check("18. Shopify+Walmart + 2 extra geos on billed $500",
  { marketplaces: ["Shopify", "Walmart"], tier: 1, globalOn: true, geos: ["US", "CA", "DE"] },
  { billed: 500, global: 200, subtotal: 700, total: 700, dealOn: true });

check("19. Enterprise 2 unchanged",
  { marketplaces: ["Amazon", "Walmart"], tier: 3 },
  { billed: 3150, dealOn: false, pct: 2, planLabel: "Enterprise 2" });

check("20. listMoney for A+W deal",
  { marketplaces: ["Amazon", "Walmart"], tier: 1 },
  { listMoney: "$1,100", dealMoney: "$500" });

if (p.geoCost(1, true) !== 0) { fails += 1; console.log("FAIL  first geo free"); } else console.log("PASS  first geo free");
if (p.geoCost(2, true) !== 100) { fails += 1; console.log("FAIL  2 geos = $100"); } else console.log("PASS  2 geos = $100");
if (p.geoCost(3, true) !== 200) { fails += 1; console.log("FAIL  3 geos = $200"); } else console.log("PASS  3 geos = $200");
if (p.recommendTier(1000000, 1) !== null) { fails += 1; console.log("FAIL  rec under $3M"); } else console.log("PASS  rec under $3M is null");
if (p.recommendTier(3000000, 1) !== 1) { fails += 1; console.log("FAIL  rec at $3M is Gold"); } else console.log("PASS  rec at $3M is Gold (no auto-jump)");

console.log(fails ? "\n" + fails + " FAILED" : "\nAll pricing fixtures passed.");
process.exit(fails ? 1 : 0);
