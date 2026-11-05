/* NV Atlas corpus explorer: dependency-free, static, and URL-addressable. */
(() => {
  "use strict";

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const svgNS = "http://www.w3.org/2000/svg";
  const state = {
    data: [],
    query: "",
    category: "all",
    checked: "all",
    term: "",
    sort: "id",
    direction: "asc",
    page: 1,
    perPage: 20,
    lang: localStorage.getItem("nvatlas-language") || "en",
  };

  const I18N = {
    en: {
      brandSubtitle: "Translation corpus explorer", navExplore: "Explore", navReport: "Learning report", navCodebook: "Codebook", navAiUse: "AI use",
      eyebrow: "Corpus study · 2026R1", heroTitle: "How does a nominal become a verb?",
      heroLede: "An interactive exploration of 500 English–Chinese sentence pairs, tracing the distance between an English key nominal and the Chinese verb supplied for it.",
      exploreButton: "Explore the corpus ↓", readReport: "Read the learning report",
      heroNote: "When one English noun has several Chinese verb renderings, consistency is not a given. It is a question about context, convention, and the limits of a two-column dataset.",
      statEntries: "sentence pairs", statTerms: "English key terms", exploreEyebrow: "The corpus", exploreTitle: "Read between the pairs.",
      exploreIntro: "Filter the dataset, select a term, and watch every view recalculate. Search state is stored in the URL so a particular reading can be shared.",
      searchPlaceholder: "Search English, Chinese, or key term…", categoryLabel: "Rendering pattern", allCategories: "All patterns",
      conventionalRendering: "Conventional rendering", alternativeRendering: "Alternative rendering", singleInstance: "Single instance",
      checkedLabel: "Human checked", allChecks: "All records", checkedYes: "Yes", checkedNo: "No", clearFilters: "Clear filters",
      urlHint: "Shareable URL state", networkTitle: "Rendering network",
      networkCaption: "Which key terms have competing Chinese renderings, and how often does each alternative occur?", networkType: "RELATIONAL",
      topTermsLabel: "Top terms", minLinksLabel: "Min. pair frequency", resetView: "Reset view", englishTerm: "English key term", chineseRendering: "Chinese rendering",
      barTitle: "Pattern distribution", barCaption: "How are filtered entries distributed across the three consistency patterns?", barType: "DISTRIBUTIONAL",
      heatTitle: "Term × rendering heatmap", heatCaption: "Where do the most frequent key terms concentrate into one rendering or spread across several?", heatType: "DISTRIBUTIONAL",
      kwicTitle: "Bilingual KWIC", kwicCaption: "What does the Chinese rendering look like in the immediate context of each English sentence?", kwicType: "LEXICAL",
      noTermSelected: "Select a term in the network or heatmap to focus.", clearTerm: "Clear selected term",
      tableTitle: "Corpus data grid", tableCaption: "Which entries support the current reading? Sort the table and export exactly what you see.", exportCsv: "Export filtered CSV ↓",
      colId: "ID", colEnglish: "English source", colChinese: "Chinese target", colKeyTerm: "Key term", colCategory: "Pattern", colChecked: "Checked",
      previous: "Previous", next: "Next", takeawayEyebrow: "A provisional finding", takeawayTitle: "Consistency is local, not absolute.",
      takeawayBody: "The most frequent key term, attention, occurs 45 times and has four Chinese renderings. Even terms with a dominant rendering have alternatives; the corpus invites a closer look at context rather than a simple “correct/incorrect” judgment.",
      readAnalysis: "Read the analysis →", footerNote: "A static corpus explorer built with HTML, CSS, JavaScript, and a JSON data layer."
    },
    zh: {
      brandSubtitle: "翻譯語料庫探索器", navExplore: "探索", navReport: "學習報告", navCodebook: "分類準則", navAiUse: "AI 使用",
      eyebrow: "語料研究 · 2026R1", heroTitle: "名詞如何變成動詞？",
      heroLede: "以互動方式探索 500 組英中句對，追蹤英文關鍵名詞與所提供中文動詞之間的距離。",
      exploreButton: "探索語料庫 ↓", readReport: "閱讀學習報告",
      heroNote: "當一個英文名詞有多個中文動詞譯法時，一致性並非理所當然。它關乎語境、慣例，以及兩欄資料集的限制。",
      statEntries: "組句對", statTerms: "個英文關鍵詞", exploreEyebrow: "語料庫", exploreTitle: "在句對之間細讀。",
      exploreIntro: "篩選資料、選擇詞項，並觀看所有視圖同步更新。搜尋狀態會儲存在網址中，方便分享特定觀點。",
      searchPlaceholder: "搜尋英文、中文或關鍵詞…", categoryLabel: "譯法模式", allCategories: "所有模式",
      conventionalRendering: "慣用譯法", alternativeRendering: "替代譯法", singleInstance: "單一例子",
      checkedLabel: "人工核對", allChecks: "所有紀錄", checkedYes: "是", checkedNo: "否", clearFilters: "清除篩選",
      urlHint: "可分享的網址狀態", networkTitle: "譯法網絡圖",
      networkCaption: "哪些關鍵詞有多個中文譯法？每種替代譯法出現多少次？", networkType: "關係型",
      topTermsLabel: "顯示詞項", minLinksLabel: "最低配對頻率", resetView: "重設視圖", englishTerm: "英文關鍵詞", chineseRendering: "中文譯法",
      barTitle: "模式分佈", barCaption: "篩選後的條目如何分佈於三種一致性模式？", barType: "分佈型",
      heatTitle: "詞項 × 譯法熱力圖", heatCaption: "最高頻的關鍵詞傾向集中於一種譯法，還是分散於多種譯法？", heatType: "分佈型",
      kwicTitle: "雙語 KWIC", kwicCaption: "中文譯法在每句英文的緊鄰語境中呈現什麼面貌？", kwicType: "詞彙型",
      noTermSelected: "在網絡圖或熱力圖中選擇詞項以聚焦。", clearTerm: "清除所選詞項",
      tableTitle: "語料資料表", tableCaption: "哪些條目支持目前的解讀？排序表格並匯出你眼前所見的資料。", exportCsv: "匯出篩選 CSV ↓",
      colId: "編號", colEnglish: "英文原文", colChinese: "中文譯文", colKeyTerm: "關鍵詞", colCategory: "模式", colChecked: "核對",
      previous: "上一頁", next: "下一頁", takeawayEyebrow: "一項暫時發現", takeawayTitle: "一致性是局部的，而非絕對的。",
      takeawayBody: "最高頻的關鍵詞 attention 出現 45 次，共有四種中文譯法。即使有主導譯法的詞項也存在替代譯法；語料庫邀請我們細看語境，而非作簡單的「對／錯」判斷。",
      readAnalysis: "閱讀分析 →", footerNote: "以 HTML、CSS、JavaScript 與 JSON 資料層建立的靜態語料庫探索器。"
    }
  };

  const T = (key) => (I18N[state.lang] && I18N[state.lang][key]) || I18N.en[key] || key;
  const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const catLabel = (cat) => ({
    conventional_rendering: state.lang === "zh" ? "慣用譯法" : "Conventional rendering",
    alternative_rendering: state.lang === "zh" ? "替代譯法" : "Alternative rendering",
    single_instance: state.lang === "zh" ? "單一例子" : "Single instance",
  }[cat] || cat);

  function readUrl() {
    const p = new URLSearchParams(location.search);
    state.query = p.get("q") || "";
    state.category = p.get("category") || "all";
    state.checked = p.get("checked") || "all";
    state.term = p.get("term") || "";
    state.sort = p.get("sort") || "id";
    state.direction = p.get("dir") === "desc" ? "desc" : "asc";
    state.page = Math.max(1, Number(p.get("page")) || 1);
  }

  function writeUrl() {
    const p = new URLSearchParams();
    if (state.query) p.set("q", state.query);
    if (state.category !== "all") p.set("category", state.category);
    if (state.checked !== "all") p.set("checked", state.checked);
    if (state.term) p.set("term", state.term);
    if (state.sort !== "id") p.set("sort", state.sort);
    if (state.direction !== "asc") p.set("dir", state.direction);
    if (state.page > 1) p.set("page", String(state.page));
    const query = p.toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
  }

  function filtered() {
    const q = state.query.trim().toLowerCase();
    return state.data.filter((entry) => {
      if (state.category !== "all" && entry.category !== state.category) return false;
      if (state.checked !== "all" && entry.human_checked !== state.checked) return false;
      if (state.term && entry.key_term_normalized !== state.term) return false;
      if (!q) return true;
      return [entry.source_text, entry.target_text, entry.key_term, entry.target_term, entry.category, entry.id]
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }

  function sortRows(rows) {
    const key = state.sort;
    const dir = state.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      return typeof av === "number" && typeof bv === "number"
        ? (av - bv) * dir
        : String(av).localeCompare(String(bv), "en") * dir;
    });
  }

  function renderAll() {
    const rows = filtered();
    const pages = Math.max(1, Math.ceil(rows.length / state.perPage));
    state.page = Math.min(state.page, pages);
    renderNetwork(rows);
    renderBar(rows);
    renderHeatmap(rows);
    renderKwic(rows);
    renderTable(rows);
    $("#resultCount").textContent = `${rows.length.toLocaleString()} ${state.lang === "zh" ? "條紀錄" : rows.length === 1 ? "entry" : "entries"}`;
    writeUrl();
  }

  function resizeSvg(svg) {
    const rect = svg.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${rect.width || 800} ${rect.height || 430}`);
    return { width: rect.width || 800, height: rect.height || 430 };
  }

  function activeTerm(term) {
    state.term = state.term === term ? "" : term;
    state.page = 1;
    renderAll();
  }

  function renderNetwork(rows) {
    const svg = $("#network");
    svg.innerHTML = "";
    if (!rows.length) {
      svg.innerHTML = `<text x="12" y="32" class="node-label">${state.lang === "zh" ? "沒有符合條件的紀錄" : "No matching records"}</text>`;
      return;
    }
    const { width, height } = resizeSvg(svg);
    const topN = Number($("#topTerms").value);
    const minLinks = Number($("#minLinks").value);
    const byTerm = new Map();
    rows.forEach((entry) => {
      const term = entry.key_term_normalized;
      if (!byTerm.has(term)) byTerm.set(term, { term, entries: [], renderings: new Map() });
      const node = byTerm.get(term);
      node.entries.push(entry);
      node.renderings.set(entry.target_term, (node.renderings.get(entry.target_term) || 0) + 1);
    });
    const terms = [...byTerm.values()]
      .sort((a, b) => b.entries.length - a.entries.length || a.term.localeCompare(b.term))
      .slice(0, topN);
    if (!terms.length) return;

    const links = [];
    terms.forEach((node) => {
      node.renderings.forEach((count, target) => {
        if (count >= minLinks) links.push({ source: node.term, target, count });
      });
    });
    const targetCounts = new Map();
    links.forEach((link) => targetCounts.set(link.target, (targetCounts.get(link.target) || 0) + link.count));
    const maxTargets = Math.max(8, Math.min(20, Math.floor((height - 70) / 24)));
    const targets = [...targetCounts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, maxTargets)
      .map(([target]) => target);
    const presentTargets = new Set(targets);

    const leftX = Math.min(175, width * .2);
    const rightX = Math.max(360, width - Math.min(210, width * .19));
    const top = 35;
    const usable = height - 70;
    const leftGap = terms.length > 1 ? usable / (terms.length - 1) : 0;
    const rightGap = targets.length > 1 ? usable / (targets.length - 1) : 0;
    const positions = new Map();
    terms.forEach((node, i) => positions.set(`source:${node.term}`, { x: leftX, y: top + (leftGap * i), node }));
    targets.forEach((target, i) => positions.set(`target:${target}`, { x: rightX, y: top + (rightGap * i), target }));

    const g = document.createElementNS(svgNS, "g");
    svg.appendChild(g);
    const linkGroup = document.createElementNS(svgNS, "g");
    g.appendChild(linkGroup);
    links.filter((link) => presentTargets.has(link.target)).forEach((link) => {
      const from = positions.get(`source:${link.source}`);
      const to = positions.get(`target:${link.target}`);
      const path = document.createElementNS(svgNS, "path");
      const bend = (to.x - from.x) * .48;
      path.setAttribute("d", `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`);
      path.setAttribute("fill", "none");
      path.setAttribute("class", `link-line${state.term && (link.source === state.term || link.target === state.term) ? " highlight" : ""}`);
      path.setAttribute("stroke-width", Math.max(1, Math.min(5, Math.sqrt(link.count) * 1.5)));
      const title = document.createElementNS(svgNS, "title");
      title.textContent = `${link.source} → ${link.target}: ${link.count}`;
      path.appendChild(title);
      linkGroup.appendChild(path);
    });

    terms.forEach((node) => {
      const pos = positions.get(`source:${node.term}`);
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", pos.x);
      circle.setAttribute("cy", pos.y);
      circle.setAttribute("r", Math.max(5, Math.min(16, 4 + Math.sqrt(node.entries.length) * 1.7)));
      circle.setAttribute("class", `node-source${state.term === node.term ? " selected" : ""}`);
      circle.dataset.term = node.term;
      circle.setAttribute("tabindex", "0");
      circle.setAttribute("role", "button");
      circle.setAttribute("aria-label", `${node.term}, ${node.entries.length} entries`);
      circle.addEventListener("click", () => activeTerm(node.term));
      circle.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") activeTerm(node.term); });
      g.appendChild(circle);
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", pos.x - 18);
      label.setAttribute("y", pos.y + 3);
      label.setAttribute("text-anchor", "end");
      label.setAttribute("class", "node-label");
      label.textContent = node.term;
      g.appendChild(label);
    });

    targets.forEach((target) => {
      const pos = positions.get(`target:${target}`);
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", pos.x);
      circle.setAttribute("cy", pos.y);
      circle.setAttribute("r", Math.max(5, Math.min(12, 4 + Math.sqrt(targetCounts.get(target)) * 1.3)));
      circle.setAttribute("class", `node-target${state.term === target ? " selected" : ""}`);
      circle.setAttribute("tabindex", "0");
      circle.setAttribute("role", "button");
      circle.setAttribute("aria-label", `Search Chinese rendering ${target}`);
      circle.addEventListener("click", () => {
        state.query = target;
        state.term = "";
        state.page = 1;
        $("#search").value = target;
        renderAll();
      });
      g.appendChild(circle);
      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", pos.x + 18);
      label.setAttribute("y", pos.y + 3);
      label.setAttribute("class", "node-label");
      label.textContent = target;
      g.appendChild(label);
    });
  }

  function renderBar(rows) {
    const root = $("#barChart");
    const counts = { conventional_rendering: 0, alternative_rendering: 0, single_instance: 0 };
    rows.forEach((entry) => counts[entry.category]++);
    const max = Math.max(1, ...Object.values(counts));
    root.innerHTML = Object.entries(counts).map(([cat, count]) => `
      <div class="bar-row" data-category="${cat}" tabindex="0" role="button" aria-label="${esc(catLabel(cat))}: ${count}">
        <div class="bar-label"><span>${esc(catLabel(cat))}</span><span>${count}</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${(count / max) * 100}%"></div></div>
      </div>`).join("");
    $$(".bar-row", root).forEach((row) => {
      const activate = () => {
        state.category = state.category === row.dataset.category ? "all" : row.dataset.category;
        $("#categoryFilter").value = state.category;
        state.page = 1;
        renderAll();
      };
      row.addEventListener("click", activate);
      row.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") activate(); });
    });
  }

  function renderHeatmap(rows) {
    const root = $("#heatmap");
    if (!rows.length) {
      root.innerHTML = `<div class="empty-state">${state.lang === "zh" ? "沒有符合條件的紀錄" : "No matching records"}</div>`;
      return;
    }
    const terms = new Map();
    rows.forEach((entry) => {
      if (!terms.has(entry.key_term_normalized)) terms.set(entry.key_term_normalized, []);
      terms.get(entry.key_term_normalized).push(entry.target_term);
    });
    const selected = [...terms.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 10);
    const renderings = [...new Set(selected.flatMap(([, list]) => list))].slice(0, 8);
    const counts = new Map();
    rows.forEach((entry) => {
      const key = `${entry.key_term_normalized}\u0000${entry.target_term}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const max = Math.max(1, ...[...counts.values()]);
    const cellW = 54;
    const rowH = 36;
    const left = 126;
    const top = 76;
    const width = left + renderings.length * cellW + 15;
    const height = top + selected.length * rowH + 12;
    let cells = "";
    selected.forEach(([term, list], row) => {
      cells += `<text x="0" y="${top + row * rowH + 22}" class="heat-label term">${esc(term)}</text>`;
      renderings.forEach((rendering, col) => {
        const count = counts.get(`${term}\u0000${rendering}`) || 0;
        const opacity = count ? .2 + (count / max) * .8 : 0;
        cells += `<rect class="heat-cell" data-term="${esc(term)}" data-rendering="${esc(rendering)}" x="${left + col * cellW}" y="${top + row * rowH}" width="${cellW - 4}" height="${rowH - 4}" fill="${count ? `rgba(110, 145, 70, ${opacity})` : "#ebe9df"}" tabindex="0" role="button" aria-label="${esc(term)} ${esc(rendering)} ${count}"><title>${esc(term)} → ${esc(rendering)}: ${count}</title></rect>`;
        if (count) cells += `<text x="${left + col * cellW + cellW / 2 - 2}" y="${top + row * rowH + 21}" text-anchor="middle" class="heat-label">${count}</text>`;
      });
    });
    renderings.forEach((rendering, col) => {
      cells += `<text x="${left + col * cellW + cellW / 2}" y="44" text-anchor="middle" class="heat-label">${esc(rendering)}</text>`;
    });
    root.innerHTML = `<svg viewBox="0 0 ${width} ${height}" aria-label="Heatmap"><g>${cells}</g></svg><div class="heat-legend"><span>0</span><i></i><span>${max}</span></div>`;
    $$(".heat-cell", root).forEach((cell) => {
      const activate = () => {
        if (cell.dataset.rendering) {
          state.query = cell.dataset.rendering;
          state.term = cell.dataset.term;
          $("#search").value = state.query;
          state.page = 1;
          renderAll();
        }
      };
      cell.addEventListener("click", activate);
      cell.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") activate(); });
    });
  }

  function highlight(text, term) {
    if (!term) return esc(text);
    const safe = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return esc(text).replace(new RegExp(`(${safe})`, "gi"), "<span class=\"kwic-term\">$1</span>");
  }

  function renderKwic(rows) {
    const root = $("#kwic");
    const label = $("#selectedTermLabel");
    const clear = $("#clearTerm");
    const term = state.term;
    label.textContent = term
      ? `${state.lang === "zh" ? "已選詞項" : "Selected term"}: ${term}`
      : (state.lang === "zh" ? "在網絡圖或熱力圖中選擇詞項以聚焦。" : "Select a term in the network or heatmap to focus.");
    clear.classList.toggle("hidden", !term);
    const shown = rows.slice(0, 50);
    root.innerHTML = shown.length ? shown.map((entry) => `
      <div class="kwic-item" data-id="${esc(entry.id)}" tabindex="0">
        <span class="kwic-id">${esc(entry.id)}</span>
        <span>${highlight(entry.source_text, entry.key_term)} <button type="button" class="term-chip" data-search="${esc(entry.key_term)}">${esc(entry.key_term)}</button></span>
        <span class="kwic-target">${highlight(entry.target_text, entry.target_term)} <button type="button" class="term-chip" data-search="${esc(entry.target_term)}">${esc(entry.target_term)}</button></span>
      </div>`).join("") : `<div class="empty-state">${state.lang === "zh" ? "沒有符合條件的例子。" : "No matching examples."}</div>`;
    $$(".kwic-item", root).forEach((item) => {
      item.addEventListener("click", () => {
        state.query = item.dataset.id;
        $("#search").value = state.query;
        state.page = 1;
        renderAll();
      });
    });
    $$(".term-chip", root).forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      state.query = button.dataset.search;
      state.term = "";
      $("#search").value = state.query;
      state.page = 1;
      renderAll();
    }));
  }

  function renderTable(rows) {
    const sorted = sortRows(rows);
    const pages = Math.max(1, Math.ceil(sorted.length / state.perPage));
    const start = (state.page - 1) * state.perPage;
    const visible = sorted.slice(start, start + state.perPage);
    const tbody = $("#tableBody");
    tbody.innerHTML = visible.length ? visible.map((entry) => `
      <tr>
        <td>${esc(entry.id)}</td>
        <td>${esc(entry.source_text)}</td>
        <td>${esc(entry.target_text)}</td>
        <td><button type="button" class="table-term" data-term="${esc(entry.key_term_normalized)}">${esc(entry.key_term)}</button><br><button type="button" class="table-term" data-search="${esc(entry.target_term)}">${esc(entry.target_term)}</button></td>
        <td><span class="pattern-tag ${esc(entry.category)}">${esc(catLabel(entry.category))}</span></td>
        <td><span class="check-tag">${esc(entry.human_checked)}</span></td>
      </tr>`).join("") : `<tr><td colspan="6" class="empty-state">${state.lang === "zh" ? "沒有符合條件的紀錄。" : "No matching records."}</td></tr>`;
    $$(".table-term", tbody).forEach((button) => button.addEventListener("click", () => {
      if (button.dataset.search) {
        state.query = button.dataset.search;
        state.term = "";
        $("#search").value = state.query;
      } else {
        state.term = button.dataset.term;
        state.query = "";
        $("#search").value = "";
      }
      state.page = 1;
      renderAll();
    }));
    $("#pageInfo").textContent = `${state.lang === "zh" ? "第" : "Page"} ${state.page} / ${pages} · ${sorted.length} ${state.lang === "zh" ? "條" : "rows"}`;
    $("#prevPage").disabled = state.page <= 1;
    $("#nextPage").disabled = state.page >= pages;
  }

  function exportCsv() {
    const rows = sortRows(filtered());
    const columns = ["id", "source_text", "target_text", "source", "category", "human_checked", "unit", "key_term", "target_term", "script_profile", "quality_flags"];
    const record = (value) => `"${String(Array.isArray(value) ? value.join("|") : value ?? "").replace(/"/g, '""')}"`;
    const csv = [columns.join(","), ...rows.map((row) => columns.map((col) => record(row[col])).join(","))].join("\n");
    const blob = new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `nvatlas-filtered-${rows.length}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  function applyLanguage() {
    document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : "en";
    $$("[data-i18n]").forEach((node) => {
      const key = node.dataset.i18n;
      if (I18N[state.lang] && I18N[state.lang][key]) node.textContent = I18N[state.lang][key];
    });
    $$("[data-i18n-placeholder]").forEach((node) => {
      const key = node.dataset.i18nPlaceholder;
      if (I18N[state.lang] && I18N[state.lang][key]) node.placeholder = I18N[state.lang][key];
    });
    $$("[data-lang]").forEach((button) => button.classList.toggle("active", button.dataset.lang === state.lang));
    if ($("#categoryFilter")) {
      const options = $$("#categoryFilter option");
      const labels = {
        en: ["All patterns", "Conventional rendering", "Alternative rendering", "Single instance"],
        zh: ["所有模式", "慣用譯法", "替代譯法", "單一例子"],
      };
      options.forEach((option, index) => { option.textContent = labels[state.lang][index]; });
    }
    if ($("#checkedFilter")) {
      const options = $$("#checkedFilter option");
      const labels = { en: ["All records", "Yes", "No"], zh: ["所有紀錄", "是", "否"] };
      options.forEach((option, index) => { option.textContent = labels[state.lang][index]; });
    }
    const search = $("#search");
    if (search) search.placeholder = state.lang === "zh" ? "搜尋英文、中文或關鍵詞…" : "Search English, Chinese, or key term…";
    if (state.data.length) renderAll();
  }

  function bind() {
    $("#search").addEventListener("input", (event) => { state.query = event.target.value; state.page = 1; renderAll(); });
    $("#categoryFilter").addEventListener("change", (event) => { state.category = event.target.value; state.page = 1; renderAll(); });
    $("#checkedFilter").addEventListener("change", (event) => { state.checked = event.target.value; state.page = 1; renderAll(); });
    $("#clearFilters").addEventListener("click", () => {
      state.query = ""; state.category = "all"; state.checked = "all"; state.term = ""; state.page = 1;
      $("#search").value = ""; $("#categoryFilter").value = "all"; $("#checkedFilter").value = "all"; renderAll();
    });
    $("#topTerms").addEventListener("input", (event) => { $("#topTermsValue").value = event.target.value; renderNetwork(filtered()); });
    $("#minLinks").addEventListener("input", (event) => { $("#minLinksValue").value = event.target.value; renderNetwork(filtered()); });
    $("#resetNetwork").addEventListener("click", () => {
      $("#topTerms").value = 12; $("#minLinks").value = 1; $("#topTermsValue").value = 12; $("#minLinksValue").value = 1;
      state.term = ""; renderAll();
    });
    $("#clearTerm").addEventListener("click", () => { state.term = ""; state.query = ""; $("#search").value = ""; renderAll(); });
    $("#exportCsv").addEventListener("click", exportCsv);
    $("#prevPage").addEventListener("click", () => { state.page--; renderTable(filtered()); writeUrl(); });
    $("#nextPage").addEventListener("click", () => { state.page++; renderTable(filtered()); writeUrl(); });
    $$("[data-sort]").forEach((button) => button.addEventListener("click", () => {
      const key = button.dataset.sort;
      state.direction = state.sort === key && state.direction === "asc" ? "desc" : "asc";
      state.sort = key; state.page = 1; renderTable(filtered()); writeUrl();
    }));
    $$("[data-lang]").forEach((button) => button.addEventListener("click", () => {
      state.lang = button.dataset.lang; localStorage.setItem("nvatlas-language", state.lang); applyLanguage();
    }));
    $(".menu-button").addEventListener("click", (event) => {
      const header = $(".site-header");
      const open = header.classList.toggle("menu-open");
      event.currentTarget.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "/" && document.activeElement !== $("#search")) { event.preventDefault(); $("#search").focus(); }
    });
    window.addEventListener("resize", () => { if (state.data.length) renderNetwork(filtered()); });
  }

  async function init() {
    readUrl();
    $("#search").value = state.query;
    $("#categoryFilter").value = state.category;
    $("#checkedFilter").value = state.checked;
    if (state.lang === "zh") applyLanguage();
    const response = await fetch("data/corpus.json");
    if (!response.ok) throw new Error(`Could not load corpus: ${response.status}`);
    const payload = await response.json();
    state.data = payload.entries;
    bind();
    applyLanguage();
    renderAll();
    window.__NVATLAS__ = { state, filtered, renderAll };
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
