window.RADash = (function () {
  const THEME_KEY = "ra-theme";
  const NUM_FONT_KEY = "ra-num-font";
  const HERO_FONT_KEY = "ra-hero-num-font";

  /** Body / section numbers across platform pages */
  const NUM_FONTS = [
    { id: "instrument", label: "Instrument Serif" },
    { id: "playfair", label: "Playfair Display" },
    { id: "literata", label: "Literata" },
    { id: "fraunces", label: "Fraunces" },
    { id: "serif", label: "DM Serif Display" },
    { id: "mono", label: "JetBrains Mono" },
    { id: "sans", label: "DM Sans" },
  ];
  /** Overview hero giants only — exactly 6 */
  const HERO_FONTS = [
    { id: "instrument", label: "Instrument Serif" },
    { id: "playfair", label: "Playfair Display" },
    { id: "fraunces", label: "Fraunces" },
    { id: "serif", label: "DM Serif Display" },
    { id: "literata", label: "Literata" },
    { id: "mono", label: "JetBrains Mono" },
  ];
  const NUM_FONT_DEFAULT = "instrument";
  const HERO_FONT_DEFAULT = "instrument";

  function bootTheme() {
    let theme = "light";
    try {
      theme = localStorage.getItem(THEME_KEY) || "light";
    } catch (e) {}
    if (theme !== "light" && theme !== "dark") theme = "light";
    document.documentElement.setAttribute("data-theme", theme);
    return theme;
  }

  function pickFontId(key, list, fallback) {
    let id = fallback;
    try {
      id = localStorage.getItem(key) || fallback;
    } catch (e) {}
    if (!list.some((f) => f.id === id)) id = fallback;
    return id;
  }

  function getNumFont() {
    return pickFontId(NUM_FONT_KEY, NUM_FONTS, NUM_FONT_DEFAULT);
  }

  function getHeroFont() {
    return pickFontId(HERO_FONT_KEY, HERO_FONTS, HERO_FONT_DEFAULT);
  }

  function setNumFont(id) {
    if (!NUM_FONTS.some((f) => f.id === id)) id = NUM_FONT_DEFAULT;
    document.documentElement.setAttribute("data-num-font", id);
    try {
      localStorage.setItem(NUM_FONT_KEY, id);
    } catch (e) {}
    const sel = document.getElementById("raSettingsNumFont");
    if (sel) sel.value = id;
    window.dispatchEvent(new CustomEvent("ra-num-font", { detail: { id } }));
  }

  function setHeroFont(id) {
    if (!HERO_FONTS.some((f) => f.id === id)) id = HERO_FONT_DEFAULT;
    document.documentElement.setAttribute("data-hero-num-font", id);
    try {
      localStorage.setItem(HERO_FONT_KEY, id);
    } catch (e) {}
    const sel = document.getElementById("raSettingsHeroFont");
    if (sel) sel.value = id;
    window.dispatchEvent(new CustomEvent("ra-hero-num-font", { detail: { id } }));
  }

  function bootFonts() {
    setNumFont(getNumFont());
    setHeroFont(getHeroFont());
  }

  bootTheme();
  bootFonts();

  const NAV = [
    { id: "overview", label: "总览", href: "index.html", state: "已完成" },
    { id: "bilibili", label: "B站", href: "platforms/bilibili.html", state: "已完成" },
    { id: "douyin", label: "抖音", href: "platforms/douyin.html", state: "已完成" },
    { id: "wechat", label: "微信生态", href: "platforms/wechat.html", state: "已完成" },
    { id: "users", label: "玩家洞察", href: "insights/users.html", state: "阶段性" },
    { id: "strategy", label: "内容策略", href: "insights/strategy.html", state: "阶段性" },
  ];

  function depthPrefix() {
    const path = location.pathname.replace(/\\/g, "/");
    if (path.includes("/platforms/") || path.includes("/insights/")) return "../";
    return "";
  }

  function fmt(n) {
    if (n == null || n === "") return "—";
    n = Number(n);
    if (Number.isNaN(n)) return "—";
    if (Math.abs(n) >= 1e8) return (n / 1e8).toFixed(2) + "亿";
    if (Math.abs(n) >= 1e4) return (n / 1e4).toFixed(1) + "万";
    if (Number.isInteger(n)) return String(n);
    return n.toFixed(1);
  }

  async function loadJSON(relPath) {
    const url = depthPrefix() + relPath.replace(/^\//, "");
    const res = await fetch(url);
    if (!res.ok) throw new Error("load fail " + url + " (" + res.status + ")");
    return res.json();
  }

  function getTheme() {
    return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  }

  function setTheme(theme) {
    theme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {}
    document.querySelectorAll(".theme-toggle").forEach((btn) => {
      btn.textContent = theme === "light" ? "深色" : "浅色";
      btn.setAttribute("aria-label", theme === "light" ? "切换到深色" : "切换到浅色");
    });
    const themeSel = document.getElementById("raSettingsTheme");
    if (themeSel) themeSel.value = theme;
    window.dispatchEvent(new CustomEvent("ra-theme", { detail: { theme } }));
  }

  function toggleTheme() {
    setTheme(getTheme() === "light" ? "dark" : "light");
  }

  function chartDefaults() {
    if (typeof Chart === "undefined") return;
    Chart.defaults.color = getTheme() === "light" ? "#5e5d59" : "#b0aea5";
    Chart.defaults.borderColor =
      getTheme() === "light" ? "rgba(20,20,19,0.08)" : "rgba(250,249,245,0.10)";
    Chart.defaults.font.family = '"DM Sans","PingFang SC","Microsoft YaHei UI",sans-serif';
    Chart.defaults.font.size = 12;
  }

  function showError(err) {
    const pre = document.createElement("pre");
    pre.style.cssText = "padding:16px;color:#e07848;white-space:pre-wrap;";
    pre.textContent = "数据加载失败：\n" + err;
    document.body.appendChild(pre);
  }

  function ensureExportScript(cb) {
    if (window.RAExport) {
      if (cb) cb();
      return;
    }
    if (document.getElementById("ra-export-script")) {
      document.getElementById("ra-export-script").addEventListener("load", () => cb && cb());
      return;
    }
    const s = document.createElement("script");
    s.id = "ra-export-script";
    s.src = depthPrefix() + "assets/js/export.js";
    s.onload = () => cb && cb();
    document.head.appendChild(s);
  }

  function ensureNavExportWrap(inner) {
    return (
      inner.querySelector(".nav-export") ||
      (() => {
        const w = document.createElement("div");
        w.className = "nav-export";
        inner.appendChild(w);
        return w;
      })()
    );
  }

  function mountThemeToggle(inner) {
    if (!inner || inner.querySelector(".theme-toggle")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn ghost theme-toggle";
    const theme = getTheme();
    btn.textContent = theme === "light" ? "深色" : "浅色";
    btn.setAttribute("aria-label", theme === "light" ? "切换到深色" : "切换到浅色");
    btn.addEventListener("click", toggleTheme);
    const wrap = ensureNavExportWrap(inner);
    wrap.insertBefore(btn, wrap.firstChild);
  }

  function optionsHtml(list, selected) {
    return list
      .map(
        (f) =>
          `<option value="${f.id}"${f.id === selected ? " selected" : ""}>${f.label}</option>`
      )
      .join("");
  }

  function ensureSettingsPanel() {
    let panel = document.getElementById("raSettingsPanel");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = "raSettingsPanel";
    panel.className = "ra-settings";
    panel.hidden = true;
    panel.innerHTML = `
      <div class="ra-settings-backdrop" data-close="1"></div>
      <aside class="ra-settings-drawer" role="dialog" aria-label="显示设置" aria-modal="true">
        <header class="ra-settings-head">
          <div>
            <strong>显示设置</strong>
            <p>仅在总览配置；选项会记住，并作用于全站对应元素。</p>
          </div>
          <button type="button" class="ra-settings-close" aria-label="关闭" data-close="1">×</button>
        </header>
        <div class="ra-settings-body">
          <section class="ra-settings-block">
            <h3>主题</h3>
            <p class="ra-settings-help">整站浅色 / 深色。各页导航也可快速切换。</p>
            <label class="ra-settings-field">
              <span>外观</span>
              <select id="raSettingsTheme">
                <option value="light">浅色 Ivory</option>
                <option value="dark">深色 Espresso</option>
              </select>
            </label>
          </section>
          <section class="ra-settings-block">
            <h3>落地页大数字</h3>
            <p class="ra-settings-help">只改总览顶部两个巨型数字（平台数「4」、样本「200」），不影响正文。</p>
            <label class="ra-settings-field">
              <span>Hero 字体（6 选）</span>
              <select id="raSettingsHeroFont"></select>
            </label>
          </section>
          <section class="ra-settings-block">
            <h3>正文 / 章节数字</h3>
            <p class="ra-settings-help">覆盖各平台页章节号（如微信「04」）、流程 01–03、n=样本、指标与策略编号。拉丁数字走所选字体；中文走字体栈回退。</p>
            <label class="ra-settings-field">
              <span>数字字体</span>
              <select id="raSettingsNumFont"></select>
            </label>
          </section>
        </div>
      </aside>`;
    document.body.appendChild(panel);

    const themeSel = panel.querySelector("#raSettingsTheme");
    const heroSel = panel.querySelector("#raSettingsHeroFont");
    const numSel = panel.querySelector("#raSettingsNumFont");
    themeSel.value = getTheme();
    heroSel.innerHTML = optionsHtml(HERO_FONTS, getHeroFont());
    numSel.innerHTML = optionsHtml(NUM_FONTS, getNumFont());

    themeSel.addEventListener("change", () => setTheme(themeSel.value));
    heroSel.addEventListener("change", () => setHeroFont(heroSel.value));
    numSel.addEventListener("change", () => setNumFont(numSel.value));

    panel.addEventListener("click", (e) => {
      if (e.target && e.target.getAttribute("data-close")) closeSettings();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !panel.hidden) closeSettings();
    });
    return panel;
  }

  function openSettings() {
    const panel = ensureSettingsPanel();
    panel.hidden = false;
    document.documentElement.classList.add("ra-settings-open");
    const themeSel = panel.querySelector("#raSettingsTheme");
    const heroSel = panel.querySelector("#raSettingsHeroFont");
    const numSel = panel.querySelector("#raSettingsNumFont");
    if (themeSel) themeSel.value = getTheme();
    if (heroSel) heroSel.value = getHeroFont();
    if (numSel) numSel.value = getNumFont();
  }

  function closeSettings() {
    const panel = document.getElementById("raSettingsPanel");
    if (panel) panel.hidden = true;
    document.documentElement.classList.remove("ra-settings-open");
  }

  function mountSettingsButton(inner) {
    if (!inner || inner.querySelector(".settings-toggle")) return;
    ensureSettingsPanel();
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn ghost settings-toggle";
    btn.textContent = "设置";
    btn.setAttribute("aria-label", "打开显示设置");
    btn.addEventListener("click", openSettings);
    const wrap = ensureNavExportWrap(inner);
    const themeBtn = wrap.querySelector(".theme-toggle");
    if (themeBtn) wrap.insertBefore(btn, themeBtn.nextSibling);
    else wrap.insertBefore(btn, wrap.firstChild);
  }

  function renderNav(activeId) {
    const host = document.getElementById("topnav");
    if (!host) return;
    const prefix = depthPrefix();
    const chrome = activeId === "overview" ? "overview" : "detail";
    document.documentElement.setAttribute("data-chrome", chrome);
    const links = NAV.map((item) => {
      const href = prefix + item.href;
      const active = item.id === activeId ? " active" : "";
      return `<a class="nav-link${active}" href="${href}">${item.label}<span class="state">${item.state}</span></a>`;
    }).join("");
    host.innerHTML = `
      <div class="topnav-inner">
        <div class="brand">《红警：荣耀》<em>内容生态研究</em></div>
        ${links}
        <div class="nav-export"></div>
      </div>`;
    const inner = host.querySelector(".topnav-inner");
    mountThemeToggle(inner);
    if (chrome === "overview") mountSettingsButton(inner);
    ensureExportScript(() => {
      if (window.RAExport && typeof RAExport.mountNavExport === "function") {
        RAExport.mountNavExport();
      }
    });
  }

  return {
    NAV,
    depthPrefix,
    fmt,
    loadJSON,
    renderNav,
    chartDefaults,
    showError,
    ensureExportScript,
    getTheme,
    setTheme,
    toggleTheme,
    bootTheme,
    getNumFont,
    setNumFont,
    getHeroFont,
    setHeroFont,
    openSettings,
    closeSettings,
    NUM_FONTS,
    HERO_FONTS,
    THEME_KEY,
    NUM_FONT_KEY,
    HERO_FONT_KEY,
  };
})();
