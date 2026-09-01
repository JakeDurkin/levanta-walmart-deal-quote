# How to open the Levanta Walmart deal quote mock

Static site (HTML + CSS + vanilla JS). No build step.

**Review mock — not production. Do not ship to levanta.io.**
The live GitHub Pages prototype at https://jakedurkin.github.io/levanta-upgrade-quote/ is unchanged.

Brand tokens are PMM Forest / Ivory / Gold. Official marketplace lockups only.

## Serve locally

```bash
cd /workspace/levanta-walmart-deal-quote
python3 -m http.server 8777 --bind 127.0.0.1
```

Open: http://127.0.0.1:8777/

Port **8777** is this mock. Port 8765 is the original prototype — do not reuse it.

One screen. Headline: sentence-case “Upgrade your account” (italic gold “Upgrade”).

## Pricing (Jake-authorized list + Walmart deal)

`listGold(marketplaces)` is the strikethrough / original SaaS.
`dealGold(marketplaces)` is the live quoted SaaS when Walmart is combined with another channel (Gold only), else `null`.
`compute(opts).base` is the **billed** SaaS (deal if on, else list). Geos and annual 15% apply to billed SaaS, not the struck list.

### Gold LIST / ORIGINAL

| Selection | Monthly SaaS | Variable |
|-----------|--------------|----------|
| Shopify-only | $350 | 4% |
| Walmart-only | $350 | 4% |
| Amazon-only | $750 | 3.5% |
| Amazon+Shopify (no Walmart) | $1,100 | 3.5% |
| Amazon+Walmart (no Shopify) | $1,100 | 3.5% |
| Shopify+Walmart (no Amazon) | $750 | 3.5% |
| All three (third +$350 waived) | $1,100 | 3.5% |

Gold marketplace selection list max is **$1,100**. No multi-marketplace fee beyond those list rules.

### Gold DEAL (Walmart + another channel)

| Selection | Show | Billed |
|-----------|------|--------|
| Walmart + Amazon (no Shopify) | ~~$1,100~~ $500 + 3.5% | $500 |
| Walmart + Shopify (no Amazon) | ~~$750~~ $500 + 3.5% | $500 |
| Walmart + Shopify + Amazon | ~~$1,100~~ $600 + 3.5% | $600 |

No deal (list only, no strikethrough) for: single-channel, or Amazon+Shopify without Walmart.

Enterprise 1–4 internal quote unchanged: $1,450/2.5%, $3,150/2%, $7,350/1.5%, $16,950/1%. Label “Internal quote”. No Walmart deal on Enterprise.

- Geos: first geo free, then $100/mo each additional. 3+ additional geos = $300/mo bundle. Add on top of billed SaaS.
- Annual: `round((billed SaaS + geos) * 0.15)` off. Default monthly.
- Paid placements: add-on, credits billed separately. Half-off note at ≥ $2,000.
- Launch Plan banner when `0 < annual revenue < $3M`.

```bash
node check-pricing.js
```

## Official marks

- Amazon classic smile: `assets/marketplaces/amazon-classic-smile.svg`
- Shopify 2018 bag + wordmark: `assets/marketplaces/shopify-logo-2018.svg`
- Walmart 2025 spark + wordmark: `assets/marketplaces/walmart-logo-2025-lockup.svg`
- Levanta ivory: `assets/levanta-logo-on-light.svg`
- Levanta dark: `assets/levanta-logo-on-dark.svg`
