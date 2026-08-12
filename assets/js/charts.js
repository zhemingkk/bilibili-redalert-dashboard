window.RACharts = (function () {
  const PALETTE_LIGHT = ["#e07848", "#d4a574", "#5db8a6", "#6a9bcc", "#c47a8a", "#a89f93", "#d4a27f"];
  const PALETTE_DARK = ["#f07040", "#d4a574", "#5db8a6", "#6a9bcc", "#c47a8a", "#a89888", "#d4a27f"];
  const FONT = '"DM Sans","PingFang SC",sans-serif';
  const DISPLAY = '"Cormorant Garamond","Noto Serif SC",serif';

  function isLight() {
    return document.documentElement.getAttribute("data-theme") === "light";
  }

  function accent() {
    return isLight() ? "#e07848" : "#f07040";
  }

  function themeTokens() {
    if (isLight()) {
      return {
        ink: "#1a1814",
        muted: "#6b6560",
        grid: "rgba(26,24,20,0.08)",
        panel: "#fffbf5",
        tooltipBg: "rgba(255,251,245,0.96)",
      };
    }
    return {
      ink: "#f3ebe0",
      muted: "#a89888",
      grid: "rgba(243,235,224,0.10)",
      panel: "#37312b",
      tooltipBg: "rgba(55,49,43,0.96)",
    };
  }

  function applyDefaults() {
    if (typeof Chart === "undefined") return;
    const t = themeTokens();
    Chart.defaults.color = t.muted;
    Chart.defaults.borderColor = t.grid;
    Chart.defaults.font.family = FONT;
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.legend.labels = {
      color: t.muted,
      boxWidth: 10,
      boxHeight: 10,
      padding: 16,
      font: { size: 12, family: FONT },
    };
    Chart.defaults.plugins.tooltip.backgroundColor = t.tooltipBg;
    Chart.defaults.plugins.tooltip.titleColor = t.ink;
    Chart.defaults.plugins.tooltip.bodyColor = t.muted;
    Chart.defaults.plugins.tooltip.borderColor = t.grid;
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
  }
  applyDefaults();

  function baseOpts(extra) {
    const t = themeTokens();
    return Object.assign({
      responsive: true,
      maintainAspectRatio: false,
      color: t.muted,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: t.muted,
            boxWidth: 10,
            boxHeight: 10,
            padding: 16,
            font: { size: 12, family: FONT },
          },
        },
        tooltip: {
          backgroundColor: t.tooltipBg,
          titleColor: t.ink,
          bodyColor: t.muted,
          borderColor: t.grid,
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 13, family: FONT },
          bodyFont: { size: 12, family: FONT },
        },
      },
      scales: {
        x: {
          ticks: {
            color: t.muted,
            font: { size: 12, family: FONT },
            maxRotation: 0,
          },
          grid: { color: t.grid, drawBorder: false },
          border: { color: t.grid },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: t.muted,
            font: { size: 12, family: FONT },
          },
          grid: { color: t.grid, drawBorder: false },
          border: { color: t.grid },
        },
      },
    }, extra || {});
  }

  function bar(ctx, labels, datasets, opts) {
    applyDefaults();
    const ds = (datasets || []).map((d, i) => Object.assign({
      borderRadius: 2,
      borderSkipped: false,
      maxBarThickness: 36,
      backgroundColor: d.backgroundColor || PALETTE[i % PALETTE.length],
    }, d));
    return new Chart(ctx, {
      type: "bar",
      data: { labels, datasets: ds },
      options: baseOpts(Object.assign({
        plugins: Object.assign({}, baseOpts().plugins, (opts && opts.plugins) || {}),
      }, opts || {})),
    });
  }

  function doughnut(ctx, labels, data, colors) {
    applyDefaults();
    const t = themeTokens();
    return new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors || PALETTE,
          borderColor: t.panel,
          borderWidth: 2,
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: {
            position: "right",
            labels: {
              color: t.muted,
              boxWidth: 12,
              boxHeight: 12,
              padding: 14,
              font: { size: 13, family: FONT },
            },
          },
          tooltip: {
            backgroundColor: t.tooltipBg,
            titleColor: t.ink,
            bodyColor: t.muted,
            borderColor: t.grid,
            borderWidth: 1,
            padding: 10,
          },
        },
      },
    });
  }

  function hbar(ctx, labels, data, color, label) {
    applyDefaults();
    const t = themeTokens();
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: label || "数值",
          data,
          backgroundColor: color || accent(),
          borderRadius: 2,
          borderSkipped: false,
          maxBarThickness: 22,
        }],
      },
      options: baseOpts({
        indexAxis: "y",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: t.tooltipBg,
            titleColor: t.ink,
            bodyColor: t.muted,
            borderColor: t.grid,
            borderWidth: 1,
            padding: 10,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: t.muted,
              precision: 0,
              font: { size: 12, family: DISPLAY },
            },
            grid: { color: t.grid, drawBorder: false },
            border: { color: t.grid },
          },
          y: {
            ticks: {
              color: t.ink,
              font: { size: 13, family: FONT },
            },
            grid: { display: false, drawBorder: false },
            border: { color: t.grid },
          },
        },
      }),
    });
  }

  window.addEventListener("ra-theme", () => applyDefaults());

  return {
    bar, doughnut, hbar, applyDefaults, themeTokens, accent,
    get CORAL() { return accent(); },
    get PALETTE() { return isLight() ? PALETTE_LIGHT : PALETTE_DARK; },
  };
})();
