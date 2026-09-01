/* Levanta one-screen sales quoting UI — Walmart deal mock */
(function () {
  "use strict";

  var P = window.LevantaPricing;
  if (!P) return;

  var MARKETPLACES = ["Amazon", "Shopify", "Walmart"];
  var LOGOS = {
    Amazon: "assets/marketplaces/amazon-classic-smile.svg",
    Shopify: "assets/marketplaces/shopify-logo-2018.svg",
    Walmart: "assets/marketplaces/walmart-logo-2025-lockup.svg"
  };
  var GEOS = ["US", "CA", "DE", "ES", "FR", "IT", "MX", "NL", "UK"];
  var FLAG_FILE = { US: "us", CA: "ca", DE: "de", ES: "es", FR: "fr", IT: "it", MX: "mx", NL: "nl", UK: "gb" };

  var state = {
    marketplaces: [],
    revenue: 0,
    revenueStr: "",
    brands: 1,
    tier: 1,
    globalOn: false,
    geos: [],
    placementsOn: false,
    credits: 0,
    creditsStr: "",
    annual: false
  };

  function digits(str) { return String(str || "").replace(/\D/g, ""); }
  function commas(n) {
    if (n === "" || n === null || typeof n === "undefined") return "";
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  function has(arr, v) { return arr.indexOf(v) !== -1; }
  function toggle(arr, v) {
    var i = arr.indexOf(v);
    if (i === -1) arr.push(v);
    else arr.splice(i, 1);
  }
  function flag(code) {
    return "assets/flags/" + (FLAG_FILE[code] || code.toLowerCase()) + ".png";
  }
  function icoCheck() {
    return '<svg class="mp-check" width="18" height="18" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="8" fill="#E48C34"/><path d="M4.5 8.2l2.3 2.3 4.7-5" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function strikeMoney(listAmt, billedAmt) {
    if (listAmt != null && billedAmt != null && listAmt !== billedAmt) {
      return '<s class="strike">' + P.money(listAmt) + '</s> <span class="deal-fig">' + P.money(billedAmt) + "</span>";
    }
    return P.money(billedAmt);
  }

  function offerLabel(surface) {
    if (surface === "forest") return '<span class="pill">WALMART OFFER</span>';
    return '<div class="offer-label">WALMART OFFER</div>';
  }

  function quoteView(calc) {
    calc.list = calc.listBase;
    calc.listTotal = (calc.listBase || 0) + (calc.global || 0) - (calc.annualDiscount || 0);
    calc.waivedAddOn = calc.waivedThird;
    calc.dealLabel = "WALMART OFFER";
    return calc;
  }

  function geoHelp(count) {
    if (count === 0) return "First geo is free — then $100/mo each.";
    if (count === 1) return "First geo is free — additional geos are $100/mo each.";
    if (count === 2) return "First geo free + 1 additional = $100/mo. Bundle 3+ additional for $300.";
    if (count === 3) return "First geo free + 2 additional = $200/mo. Bundle 3+ additional for $300.";
    return "Bundle applied — every geo included for $300/mo.";
  }

  function channelCards() {
    return '<div class="channel-grid">' + MARKETPLACES.map(function (m) {
      var on = has(state.marketplaces, m);
      return (
        '<button type="button" class="channel-card' + (on ? " selected" : "") + '" data-act="mkt" data-val="' + m + '" aria-pressed="' + on + '" aria-label="' + m + '">' +
          '<span class="channel-logo"><img src="' + LOGOS[m] + '" alt="' + m + '" draggable="false" /></span>' +
          (on ? icoCheck() : "") +
        "</button>"
      );
    }).join("") + "</div>";
  }

  function geoChips() {
    return '<div class="chips">' + GEOS.map(function (g) {
      var on = has(state.geos, g);
      return (
        '<button type="button" class="chip' + (on ? " selected" : "") + '" data-act="geo" data-val="' + g + '" aria-pressed="' + on + '">' +
          '<img src="' + flag(g) + '" alt="" width="20" height="14" />' + g +
        "</button>"
      );
    }).join("") + "</div>";
  }

  function navHtml() {
    return (
      '<header class="site-header"><nav class="nav-pill" aria-label="Primary">' +
        '<a class="nav-logo" href="https://www.levanta.io/" aria-label="Levanta"><img src="assets/levanta-logo-on-light.svg" alt="Levanta" /></a>' +
        '<div class="nav-links">' +
          '<a href="https://www.levanta.io/">Brands</a>' +
          '<a href="https://www.levanta.io/">Creators</a>' +
          '<a href="https://www.levanta.io/pricing">Pricing</a>' +
          '<a href="https://www.levanta.io/">Resources</a>' +
          '<a href="https://www.levanta.io/">Company</a>' +
        "</div>" +
        '<div class="nav-actions">' +
          '<a class="nav-signin" href="https://www.levanta.io/">Sign In</a>' +
          '<a class="btn-outline" href="https://www.levanta.io/">Request a Demo</a>' +
          '<a class="btn-solid" href="https://www.levanta.io/">Get Started <span>→</span></a>' +
        "</div>" +
      "</nav></header>"
    );
  }

  function footerHtml() {
    return (
      '<footer class="site-footer"><div class="footer-inner">' +
        "<div>© 2026 Levanta. All rights reserved. <span class=\"mock-note\">Walmart deal mock — not production.</span></div>" +
        '<div class="footer-links"><a href="#">Terms</a><a href="#">Privacy</a><a href="#">Contact</a></div>' +
      "</div></footer>"
    );
  }

  function summaryHtml(calc, rec) {
    var rows = "";
    if (!calc.anyMarketplace) {
      rows = '<div class="empty-sum">Select a channel to build your plan.</div>';
    } else {
      rows += '<div class="row"><span>Package</span><span class="val">' + calc.planLabel + "</span></div>";
      if (calc.waivedAddOn) {
        rows += '<div class="row"><span>Third marketplace</span><span class="val"><s class="strike">' + P.money(calc.waivedAddOn) + "</s> waived</span></div>";
      }
      rows += '<div class="row"><span>SaaS</span><span class="val">' +
        (calc.dealOn ? offerLabel("forest") + " " : "") +
        strikeMoney(calc.list, calc.base) + "/mo + " + calc.pct + "%</span></div>";
      if (state.marketplaces.length) {
        rows += '<div class="mp-pills">' + state.marketplaces.map(function (m) {
          return '<span class="pill">' + m + "</span>";
        }).join("") + "</div>";
      }
      if (state.globalOn) {
        var gLabel = Math.max(state.geos.length - 1, 0) >= P.BUNDLE_THRESHOLD
          ? "Levanta Global (all geos)"
          : "Levanta Global";
        rows += '<div class="row line"><span>' + gLabel + "</span><span class=\"val\">" + P.money(calc.global) + "/mo</span></div>";
        if (state.geos.length) {
          rows += '<div class="geo-pills">' + state.geos.map(function (g) {
            return '<span class="pill">' + g + "</span>";
          }).join("") + "</div>";
        }
      }
      if (state.annual) {
        rows += '<div class="row line"><span>Annual billing (15% off SaaS)</span><span class="val discount">−' + P.money(calc.annualDiscount) + "/mo</span></div>";
      }
      if (state.placementsOn) {
        rows += '<div class="row line"><span>Paid Placement credits</span><span class="val">' + P.money(state.credits) + "/mo</span></div>";
        rows += '<div class="muted-note">Billed separately — not in Total Monthly' +
          (state.credits >= P.CREDITS_THRESHOLD ? ' — <span class="hi">Half off placement fees applied</span>' : "") +
          "</div>";
      }
    }

    var totalInner = "—";
    if (calc.anyMarketplace) {
      totalInner = (calc.dealOn ? offerLabel("forest") + " " : "") + strikeMoney(calc.listTotal, calc.total) + "<small>/month + " + calc.pct + "%</small>";
    }

    return (
      '<aside class="summary-col"><section class="summary">' +
        '<div class="summary-head">' +
          '<img class="summary-logo" src="assets/levanta-logo-on-dark.svg" alt="Levanta" />' +
          "<h2>Your plan</h2>" +
        "</div>" +
        rows +
        '<div class="bill-toggle">' +
          '<button type="button" class="' + (!state.annual ? "on" : "") + '" data-act="bill" data-val="monthly">Monthly</button>' +
          '<button type="button" class="' + (state.annual ? "on" : "") + '" data-act="bill" data-val="annual">Annual −15%</button>' +
        "</div>" +
        '<div class="total-block"><div class="total-kicker">Total Monthly</div>' +
        '<div class="total-price" data-total="' + calc.total + '" data-list="' + calc.listTotal + '" data-pct="' + calc.pct + '">' + totalInner + "</div>" +
        (state.annual && calc.anyMarketplace ? '<div class="yr-note">Billed annually — ' + P.money(calc.total * 12) + "/yr</div>" : "") +
        "</div>" +
        '<a class="cta-full" href="https://www.levanta.io/">Get Started →</a>' +
      "</section></aside>"
    );
  }

  function packageHtml(calc, rec) {
    var goldOn = state.tier === 1;
    var goldCalc = quoteView(P.compute({
      marketplaces: state.marketplaces,
      tier: 1,
      globalOn: false,
      geos: [],
      annual: false
    }));
    var goldPrice = goldCalc.anyMarketplace ? goldCalc.base : 750;
    var goldList = goldCalc.anyMarketplace ? goldCalc.listBase : 750;
    var goldPct = goldCalc.anyMarketplace ? goldCalc.pct : 3.5;
    var goldNote = "List price · no multi-channel fee";
    if (goldCalc.litePlan && goldCalc.planLabel === "Shopify-only") goldNote = "Shopify-only plan";
    else if (goldCalc.litePlan && goldCalc.planLabel === "Walmart-only") goldNote = "Walmart-only plan";
    else if (!goldCalc.anyMarketplace) goldNote = "List price · no multi-channel fee";
    var goldRec = rec === 1 ? '<span class="rec">Recommended</span>' : "";
    var goldPriceHtml = strikeMoney(goldList, goldPrice);
    var goldOffer = goldCalc.dealOn ? offerLabel("ivory") : "";

    var gold = (
      '<button type="button" class="gold-card' + (goldOn ? " selected" : "") + '" data-act="tier" data-val="1" aria-pressed="' + goldOn + '">' +
        "<div><div class=\"name\">Gold" + goldRec + "</div>" +
        '<div class="note">' + goldNote + "</div></div>" +
        '<div class="price-block">' + goldOffer + '<div class="price">' + goldPriceHtml + "<span>/mo</span></div>" +
        '<div class="pct">+ ' + goldPct + "% of affiliate revenue</div></div>" +
        (goldOn ? icoCheck() : "") +
      "</button>"
    );

    var ents = '<div class="ent-label">Enterprise <span class="ent-internal">Internal quote</span></div><p class="ent-note">Custom on levanta.io. These figures are internal quoting only.</p><div class="ent-grid">' +
      P.TIERS.slice(1).map(function (t) {
        var on = state.tier === t.id;
        var recMark = rec === t.id ? '<span class="rec">Recommended</span>' : "";
        return (
          '<button type="button" class="ent-card' + (on ? " selected" : "") + '" data-act="tier" data-val="' + t.id + '" aria-pressed="' + on + '">' +
            '<div class="ent-name">' + t.name.replace("Enterprise ", "Ent ") + "</div>" +
            '<div class="ent-price">' + P.money(t.monthly) + "<span>/mo</span></div>" +
            '<div class="ent-pct">+ ' + t.pct + "%</div>" +
            recMark +
            (on ? icoCheck() : "") +
          "</button>"
        );
      }).join("") + "</div>";

    return gold + ents;
  }

  function headlineMeta() {
    return (
      '<div class="headline-meta">' +
        '<div class="field brands-field"><label for="brands">Brands</label>' +
        '<div class="input-row"><input id="brands" class="narrow" data-field="brands" type="number" min="1" step="1" value="' + state.brands + '" /></div></div>' +
        '<div class="field revenue-field"><label for="revenue">Annual revenue</label>' +
        '<div class="input-row"><span class="prefix">$</span>' +
        '<input id="revenue" data-field="revenue" type="text" inputmode="numeric" placeholder="Optional" value="' + state.revenueStr + '" />' +
        '<span class="suffix">/year</span></div></div>' +
      "</div>"
    );
  }

  function renderMain() {
    var rec = P.recommendTier(state.revenue, state.brands);
    var calc = quoteView(P.compute({
      marketplaces: state.marketplaces,
      tier: state.tier,
      globalOn: state.globalOn,
      geos: state.geos,
      annual: state.annual
    }));
    window.__quote = calc;

    var launch = (state.revenue > 0 && state.revenue < 3000000)
      ? '<div class="launch-banner"><div class="title">Ask our team about our Launch Plan</div><div class="sub">Brands under $3M in annual revenue qualify for special launch pricing.</div></div>'
      : "";

    var geoBody = state.globalOn
      ? '<div class="addon-body"><div class="geo-label">Select your geos</div>' +
        geoChips() +
        '<p class="helper">' + geoHelp(state.geos.length) + "</p></div>"
      : "";

    var credBody = state.placementsOn
      ? '<div class="addon-body"><div class="geo-label">Monthly credits</div>' +
        '<div class="input-row"><span class="prefix">$</span>' +
        '<input id="credits" data-field="credits" type="number" min="0" step="100" placeholder="2,000" value="' + (state.creditsStr || "") + '" />' +
        '<span class="suffix">/month</span></div>' +
        (state.credits >= P.CREDITS_THRESHOLD ? '<div class="half-note">Half off placement fees applied</div>' : "") +
        "</div>"
      : "";

    return (
      '<main class="page">' +
        '<div class="hero">' +
          '<div class="headline-row">' +
            '<div class="headline-copy">' +
              "<h1><em>Upgrade</em> <span class=\"rest\">your account</span></h1>" +
              '<p class="subline">Choose your package</p>' +
            "</div>" +
            headlineMeta() +
          "</div>" +
          launch +
        "</div>" +
        '<div class="layout">' +
          '<div class="config">' +

            '<section class="section">' +
              '<div class="section-head"><div class="section-kicker">01  Channels</div>' +
              '<h2 class="section-title">Choose your channels</h2>' +
              '<p class="section-help">Select every marketplace you sell on.</p></div>' +
              channelCards() +
            "</section>" +

            '<section class="section">' +
              '<div class="section-head"><div class="section-kicker">02  Package</div>' +
              '<h2 class="section-title">Choose your package</h2>' +
              '<p class="section-help">Gold is the standard plan. Enterprise lowers the variable rate.</p></div>' +
              packageHtml(calc, rec) +
            "</section>" +

            '<section class="section">' +
              '<div class="section-head"><div class="section-kicker">03  Add-ons</div>' +
              '<h2 class="section-title">Add-ons</h2></div>' +
              '<div class="addons">' +
                '<div class="addon' + (state.globalOn ? " open" : "") + '">' +
                  '<button type="button" class="toggle" data-act="global" aria-label="Toggle Levanta Global"></button>' +
                  '<button type="button" class="addon-top" data-act="global">' +
                    "<h3>Levanta Global</h3>" +
                    '<p class="desc">Expand into international marketplaces.</p>' +
                    '<div class="price-line"><strong>First geo free</strong> · then $100/mo each</div>' +
                    '<div class="offer">3+ additional geos — all geos for $300/mo</div>' +
                  "</button>" +
                  geoBody +
                "</div>" +
                '<div class="addon' + (state.placementsOn ? " open" : "") + '">' +
                  '<button type="button" class="toggle" data-act="place" aria-label="Toggle Paid Placements"></button>' +
                  '<button type="button" class="addon-top" data-act="place">' +
                    "<h3>Paid Placements</h3>" +
                    '<p class="desc">Premium placement across the partner network.</p>' +
                    '<div class="offer">$2,000+/mo in credits — half off placement fees</div>' +
                  "</button>" +
                  credBody +
                "</div>" +
              "</div>" +
            "</section>" +

          "</div>" +
          summaryHtml(calc, rec) +
        "</div>" +
      "</main>"
    );
  }

  function normalizeHash() {
    var h = (location.hash || "").replace(/^#/, "") || "/";
    if (h === "/upsell" || h === "upsell") {
      history.replaceState(null, "", location.pathname + location.search + "#/");
    }
  }

  function render() {
    var app = document.getElementById("app");
    if (!app) return;
    var active = document.activeElement;
    var fid = active && active.id;
    var ss = active && active.selectionStart;
    var se = active && active.selectionEnd;
    normalizeHash();
    app.innerHTML = navHtml() + renderMain() + footerHtml();
    document.title = "Upgrade your account — Levanta";
    if (fid) {
      var el = document.getElementById(fid);
      if (el && typeof el.focus === "function") {
        el.focus();
        try { if (typeof ss === "number") el.setSelectionRange(ss, se); } catch (e) {}
      }
    }
  }

  function onClick(e) {
    var t = e.target.closest("[data-act]");
    if (!t) return;
    var act = t.getAttribute("data-act");
    var val = t.getAttribute("data-val");
    if (act === "mkt") { toggle(state.marketplaces, val); render(); return; }
    if (act === "geo") {
      toggle(state.geos, val);
      if (state.geos.length && !state.globalOn) state.globalOn = true;
      render();
      return;
    }
    if (act === "global") {
      state.globalOn = !state.globalOn;
      if (!state.globalOn) state.geos = [];
      render();
      return;
    }
    if (act === "place") {
      state.placementsOn = !state.placementsOn;
      if (!state.placementsOn) { state.credits = 0; state.creditsStr = ""; }
      render();
      return;
    }
    if (act === "tier") { state.tier = Number(val); render(); return; }
    if (act === "bill") { state.annual = val === "annual"; render(); return; }
  }

  function onInput(e) {
    var f = e.target.getAttribute && e.target.getAttribute("data-field");
    if (!f) return;
    if (f === "revenue") {
      var raw = digits(e.target.value);
      state.revenue = raw ? parseInt(raw, 10) : 0;
      state.revenueStr = commas(raw);
      e.target.value = state.revenueStr;
      render();
      return;
    }
    if (f === "brands") {
      var v = parseFloat(e.target.value);
      if (!isFinite(v) || v < 1) v = 1;
      state.brands = Math.floor(v);
      render();
      return;
    }
    if (f === "credits") {
      var c = parseFloat(e.target.value);
      state.credits = !isFinite(c) || c < 0 ? 0 : c;
      state.creditsStr = e.target.value;
      render();
    }
  }

  function onBlur(e) {
    var f = e.target.getAttribute && e.target.getAttribute("data-field");
    if (f === "brands") e.target.value = String(state.brands);
  }

  var root = document.getElementById("app");
  if (!root) {
    root = document.createElement("div");
    root.id = "app";
    root.className = "app";
    document.body.insertBefore(root, document.body.firstChild);
  }
  root.classList.add("app");
  root.addEventListener("click", onClick);
  root.addEventListener("input", onInput);
  root.addEventListener("change", onInput);
  root.addEventListener("focusout", onBlur);
  window.addEventListener("hashchange", function () { normalizeHash(); render(); });
  render();
})();
