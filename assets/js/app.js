window.RADash = (function () {
  const THEME_KEY = "ra-theme";
  const NUM_FONT_KEY = "ra-num-font";
  const NUM_FONTS = [
    { id: "instrument", label: "Instrument" },
    { id: "playfair", label: "Playfair" },
    { id: "literata", label: "Literata" },
    { id: "fraunces", label: "Fraunces" },
    { id: "serif", label: "DM Serif" },
    { id: "mono", label: "JetBrains" },
    { id: "sans", label: "DM Sans" },
  ];
  const NUM_FONT_DEFAULT = "instrument";

  function bootTheme() {
    let theme = "light";
    try {
      theme = localStorage.getItem(THEME_KEY) || "light";
    } catch (e) {}
    if (theme !== "light" && theme !== "dark") theme = "light";
    document.documentElement.setAttribute("data-theme", theme);
    return theme;
  }

  function getNumFont() {
    let id = NUM_FONT_DEFAULT;
    try {
      id = localStorage.getItem(NUM_FONT_KEY) || NUM_FONT_DEFAULT;
    } catch (e) {}
    if (!NUM_FONTS.some((f) => f.id === id)) id = NUM_FONT_DEFAULT;
    return id;
  }

  function setNumFont(id) {
    if (!NUM_FONTS.some((f) => f.id === id)) id = NUM_FONT_DEFAULT;
    document.documentElement.setAttribute("data-num-font", id);
    try {
      localStorage.setItem(NUM_FONT_KEY, id);
    } catch (e) {}
    document.querySelectorAll(".num-font-pick select").forEach((sel) => {
      sel.value = id;
    });
    window.dispatchEvent(new CustomEvent("ra-num-font", { detail: { id } }));
  }

  function bootNumFont() {
    setNumFont(getNumFont());
  }

  bootTheme();
  bootNumFont();

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

  function mountNumFontPick(inner) {
    if (!inner || inner.querySelector(".num-font-pick")) return;
    const cur = getNumFont();
    const label = document.createElement("label");
    label.className = "num-font-pick";
    label.title = "数字字体";
    label.innerHTML =
      `<span>数字</span><select aria-label="选择数字字体">` +
      NUM_FONTS.map(
        (f) => `<option value="${f.id}"${f.id === cur ? " selected" : ""}>${f.label}</option>`
      ).join("") +
      `</select>`;
    label.querySelector("select").addEventListener("change", (e) => {
      setNumFont(e.target.value);
    });
    const wrap = ensureNavExportWrap(inner);
    const themeBtn = wrap.querySelector(".theme-toggle");
    if (themeBtn) wrap.insertBefore(label, themeBtn.nextSibling);
    else wrap.insertBefore(label, wrap.firstChild);
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
    mountNumFontPick(inner);
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
    NUM_FONTS,
    THEME_KEY,
    NUM_FONT_KEY,
  };
})();
