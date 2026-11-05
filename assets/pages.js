(() => {
  "use strict";

  const COMMON = {
    en: {
      brandSubtitle: "Translation corpus explorer",
      navExplore: "Explore",
      navReport: "Learning report",
      navCodebook: "Codebook",
      navAiUse: "AI use",
      backExplore: "Back to explorer",
    },
    zh: {
      brandSubtitle: "翻譯語料庫探索器",
      navExplore: "探索",
      navReport: "學習報告",
      navCodebook: "分類準則",
      navAiUse: "AI 使用",
      backExplore: "返回探索器",
    },
  };

  const buttons = [...document.querySelectorAll("[data-lang]")];

  function updateCommon(lang) {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const value = COMMON[lang] && COMMON[lang][node.dataset.i18n];
      if (value) node.textContent = value;
    });
    document.querySelectorAll("[data-page-i18n]").forEach((node) => {
      const value = COMMON[lang] && COMMON[lang][node.dataset.pageI18n];
      if (value) node.textContent = value;
    });
    buttons.forEach((button) => button.classList.toggle("active", button.dataset.lang === lang));
  }

  function setLanguage(lang) {
    localStorage.setItem("nvatlas-language", lang);
    updateCommon(lang);
  }

  buttons.forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.lang)));
  updateCommon(localStorage.getItem("nvatlas-language") || "en");

  const menu = document.querySelector(".menu-button");
  if (menu) menu.addEventListener("click", () => {
    const open = document.querySelector(".site-header").classList.toggle("menu-open");
    menu.setAttribute("aria-expanded", String(open));
  });
})();
