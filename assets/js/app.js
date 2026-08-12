window.RADash = (function () {
  const NAV = [
    { id: "overview", label: "总览", href: "index.html", state: "已完成" },
    { id: "bilibili", label: "B站", href: "platforms/bilibili.html", state: "已完成" },
    { id: "douyin", label: "抖音", href: "platforms/douyin.html", state: "已完成" },
    { id: "wechat", label: "微信生态", href: "platforms/wechat.html", state: "已完成" },
    { id: "users", label: "用户洞察", href: "insights/users.html", state: "阶段性" },
    { id: "strategy", label: "策略", href: "insights/strategy.html", state: "阶段性" },
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

  function renderNav(activeId) {
    const host = document.getElementById("topnav");
    if (!host) return;
    const prefix = depthPrefix();
    const links = NAV.map((item) => {
      const href = prefix + item.href;
      const active = item.id === activeId ? " active" : "";
      return `<a class="nav-link${active}" href="${href}">${item.label}<span class="state">${item.state}</span></a>`;
    }).join("");
    host.innerHTML = `
      <div class="topnav-inner">
        <div class="brand">《红警：荣耀》<em>内容生态研究</em></div>
        ${links}
      </div>`;
  }

  function chartDefaults() {
    if (typeof Chart === "undefined") return;
    Chart.defaults.color = "#a09d96";
    Chart.defaults.borderColor = "rgba(250,249,245,0.12)";
    Chart.defaults.font.family =
      '"DM Sans","PingFang SC","Microsoft YaHei UI",sans-serif';
  }

  function showError(err) {
    const pre = document.createElement("pre");
    pre.style.cssText = "padding:16px;color:#ff8f8f;white-space:pre-wrap;";
    pre.textContent = "数据加载失败：\n" + err;
    document.body.appendChild(pre);
  }

  return { NAV, depthPrefix, fmt, loadJSON, renderNav, chartDefaults, showError };
})();
