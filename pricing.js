/* Levanta sales quoting — official rates + authorized Walmart deal (Gold only). */
(function (root) {
  "use strict";

  var TIERS = [
    { id: 1, name: "Gold", monthly: 750, pct: 3.5 },
    { id: 2, name: "Enterprise 1", monthly: 1450, pct: 2.5 },
    { id: 3, name: "Enterprise 2", monthly: 3150, pct: 2 },
    { id: 4, name: "Enterprise 3", monthly: 7350, pct: 1.5 },
    { id: 5, name: "Enterprise 4", monthly: 16950, pct: 1 }
  ];

  var LITE_MONTHLY = 350;
  var LITE_PCT = 4;
  var SHOPIFY_ONLY_MONTHLY = 350;
  var SHOPIFY_ONLY_PCT = 4;
  var AMAZON_GOLD = 750;
  var AMAZON_SHOPIFY_LIST = 1100;
  var AMAZON_WALMART_LIST = 1100;
  var SHOPIFY_WALMART_LIST = 750;
  var ALL_THREE_LIST = 1100;
  var THIRD_WAIVED = 350;
  var DEAL_AMAZON_WALMART = 500;
  var DEAL_SHOPIFY_WALMART = 500;
  var DEAL_ALL_THREE = 600;
  var DEAL_PCT = 3.5;
  var GEO_PER = 100;
  var GEO_BUNDLE = 300;
  var BUNDLE_THRESHOLD = 3;
  var CREDITS_THRESHOLD = 2000;

  function hasMp(marketplaces, name) {
    return !!(marketplaces && marketplaces.indexOf(name) !== -1);
  }

  function isShopifyOnly(marketplaces) {
    return !!(marketplaces && marketplaces.length === 1 && marketplaces[0] === "Shopify");
  }

  function isWalmartOnly(marketplaces) {
    return !!(marketplaces && marketplaces.length === 1 && marketplaces[0] === "Walmart");
  }

  function isLiteOnly(marketplaces) {
    return isShopifyOnly(marketplaces) || isWalmartOnly(marketplaces);
  }

  function geoCost(geoCount, addonOn) {
    if (addonOn === false) return 0;
    var extra = (geoCount || 0) - 1;
    if (extra >= BUNDLE_THRESHOLD) return GEO_BUNDLE;
    return Math.max(extra, 0) * GEO_PER;
  }

  function recommendTier(revenue, brands) {
    if (!revenue || revenue < 3000000) return null;
    var revTier = 0;
    if (revenue > 120000000) revTier = 3;
    else if (revenue > 48000000) revTier = 2;
    else if (revenue > 18000000) revTier = 1;
    var brandTier = 0;
    if (brands >= 21) brandTier = 4;
    else if (brands >= 11) brandTier = 3;
    else if (brands >= 4) brandTier = 2;
    else if (brands >= 2) brandTier = 1;
    return Math.max(revTier, brandTier) + 1;
  }

  function goldMatrix(marketplaces) {
    var amazon = hasMp(marketplaces, "Amazon");
    var shopify = hasMp(marketplaces, "Shopify");
    var walmart = hasMp(marketplaces, "Walmart");
    var n = (amazon ? 1 : 0) + (shopify ? 1 : 0) + (walmart ? 1 : 0);

    if (n === 0) {
      return {
        listBase: 0,
        dealBase: null,
        pct: 3.5,
        planLabel: "Gold",
        shopifyPlan: false,
        litePlan: false,
        waivedThird: 0
      };
    }

    if (n === 1 && shopify) {
      return {
        listBase: LITE_MONTHLY,
        dealBase: null,
        pct: LITE_PCT,
        planLabel: "Shopify-only",
        shopifyPlan: true,
        litePlan: true,
        waivedThird: 0
      };
    }

    if (n === 1 && walmart) {
      return {
        listBase: LITE_MONTHLY,
        dealBase: null,
        pct: LITE_PCT,
        planLabel: "Walmart-only",
        shopifyPlan: false,
        litePlan: true,
        waivedThird: 0
      };
    }

    if (n === 1 && amazon) {
      return {
        listBase: AMAZON_GOLD,
        dealBase: null,
        pct: 3.5,
        planLabel: "Gold",
        shopifyPlan: false,
        litePlan: false,
        waivedThird: 0
      };
    }

    if (amazon && shopify && !walmart) {
      return {
        listBase: AMAZON_SHOPIFY_LIST,
        dealBase: null,
        pct: 3.5,
        planLabel: "Gold",
        shopifyPlan: false,
        litePlan: false,
        waivedThird: 0
      };
    }

    if (amazon && walmart && !shopify) {
      return {
        listBase: AMAZON_WALMART_LIST,
        dealBase: DEAL_AMAZON_WALMART,
        pct: DEAL_PCT,
        planLabel: "Gold",
        shopifyPlan: false,
        litePlan: false,
        waivedThird: 0
      };
    }

    if (shopify && walmart && !amazon) {
      return {
        listBase: SHOPIFY_WALMART_LIST,
        dealBase: DEAL_SHOPIFY_WALMART,
        pct: DEAL_PCT,
        planLabel: "Gold",
        shopifyPlan: false,
        litePlan: false,
        waivedThird: 0
      };
    }

    return {
      listBase: ALL_THREE_LIST,
      dealBase: DEAL_ALL_THREE,
      pct: DEAL_PCT,
      planLabel: "Gold",
      shopifyPlan: false,
      litePlan: false,
      waivedThird: THIRD_WAIVED
    };
  }

  function compute(opts) {
    opts = opts || {};
    var marketplaces = opts.marketplaces || [];
    var tier = opts.tier || 1;
    if (tier < 1 || tier > 5) tier = 1;
    var globalOn = !!opts.globalOn;
    var geos = opts.geos || [];
    var annual = !!opts.annual;
    var any = marketplaces.length > 0;
    var meta = TIERS[tier - 1];
    var gold = goldMatrix(marketplaces);
    var isGold = tier === 1;
    var listBase = 0;
    var dealBase = null;
    var pct = meta.pct;
    var planLabel = meta.name;
    var shopifyPlan = false;
    var litePlan = false;
    var waivedThird = 0;
    var dealOn = false;

    if (any) {
      if (isGold) {
        listBase = gold.listBase;
        dealBase = gold.dealBase;
        pct = gold.pct;
        planLabel = gold.planLabel;
        shopifyPlan = gold.shopifyPlan;
        litePlan = gold.litePlan;
        waivedThird = gold.waivedThird || 0;
        dealOn = dealBase != null;
      } else {
        listBase = meta.monthly;
        dealBase = null;
        pct = meta.pct;
        planLabel = meta.name;
        shopifyPlan = false;
        litePlan = false;
        waivedThird = 0;
        dealOn = false;
      }
    }

    var billed = dealOn ? dealBase : listBase;
    var base = billed;
    var global = geoCost(geos.length, globalOn);
    var subtotal = base + global;
    var annualDiscount = annual ? Math.round(subtotal * 0.15) : 0;

    return {
      listBase: listBase,
      dealBase: dealBase,
      billed: billed,
      base: base,
      global: global,
      subtotal: subtotal,
      annualDiscount: annualDiscount,
      total: subtotal - annualDiscount,
      pct: pct,
      planLabel: planLabel,
      tierName: meta.name,
      shopifyPlan: shopifyPlan,
      litePlan: litePlan,
      anyMarketplace: any,
      multi: 0,
      dealOn: dealOn,
      waivedThird: waivedThird,
      listMoney: money(listBase),
      dealMoney: dealBase != null ? money(dealBase) : null
    };
  }

  function money(n) {
    var abs = Math.abs(Math.round(n));
    var s = String(abs).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (n < 0 ? "-$" : "$") + s;
  }

  var api = {
    TIERS: TIERS,
    LITE_MONTHLY: LITE_MONTHLY,
    LITE_PCT: LITE_PCT,
    SHOPIFY_ONLY_MONTHLY: SHOPIFY_ONLY_MONTHLY,
    SHOPIFY_ONLY_PCT: SHOPIFY_ONLY_PCT,
    AMAZON_GOLD: AMAZON_GOLD,
    AMAZON_SHOPIFY_LIST: AMAZON_SHOPIFY_LIST,
    AMAZON_WALMART_LIST: AMAZON_WALMART_LIST,
    SHOPIFY_WALMART_LIST: SHOPIFY_WALMART_LIST,
    ALL_THREE_LIST: ALL_THREE_LIST,
    THIRD_WAIVED: THIRD_WAIVED,
    DEAL_AMAZON_WALMART: DEAL_AMAZON_WALMART,
    DEAL_SHOPIFY_WALMART: DEAL_SHOPIFY_WALMART,
    DEAL_ALL_THREE: DEAL_ALL_THREE,
    DEAL_PCT: DEAL_PCT,
    GEO_PER: GEO_PER,
    GEO_BUNDLE: GEO_BUNDLE,
    BUNDLE_THRESHOLD: BUNDLE_THRESHOLD,
    CREDITS_THRESHOLD: CREDITS_THRESHOLD,
    isShopifyOnly: isShopifyOnly,
    isWalmartOnly: isWalmartOnly,
    isLiteOnly: isLiteOnly,
    goldMatrix: goldMatrix,
    geoCost: geoCost,
    recommendTier: recommendTier,
    compute: compute,
    money: money
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof root !== "undefined") root.LevantaPricing = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
