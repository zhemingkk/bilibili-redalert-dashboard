window.RACharts = (function () {
  const CORAL = "#cc785c";
  const INK = "#faf9f5";
  const MUTED = "#a09d96";
  const GRID = "rgba(250,249,245,0.10)";
  const PANEL = "#161412";
  const PALETTE = ["#cc785c", "#d4a574", "#5db8a6", "#7aa2c4", "#c47a8a", "#a09d96", "#e8a55a"];
  const FONT = '"DM Sans","PingFang SC",sans-serif';
  const DISPLAY = '"Cormorant Garamond","Noto Serif SC",serif';

  function applyDefaults() {
    if (typeof Chart === "undefined") return;
    Chart.defaults.color = MUTED;
    Chart.defaults.borderColor = GRID;
    Chart.defaults.font.family = FONT;
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.legend.labels = {
      color: MUTED,
      boxWidth: 10,
      boxHeight: 10,
      padding: 16,
      font: { size: 12, family: FONT },
    };
    Chart.defaults.plugins.tooltip.backgroundColor = "rgba(28,26,23,0.94)";
    Chart.defaults.plugins.tooltip.titleColor = INK;
    Chart.defaults.plugins.tooltip.bodyColor = MUTED;
    Chart.defaults.plugins.tooltip.borderColor = GRID;
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
  }
  applyDefaults();

  function baseOpts(extra) {
    return Object.assign({
      responsive: true,
      maintainAspectRatio: false,
      color: MUTED,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: MUTED,
            boxWidth: 10,
            boxHeight: 10,
            padding: 16,
            font: { size: 12, family: FONT },
          },
        },
        tooltip: {
          backgroundColor: "rgba(28,26,23,0.94)",
          titleColor: INK,
          bodyColor: MUTED,
          borderColor: GRID,
          borderWidth: 1,
          padding: 10,
          titleFont: { size: 13, family: FONT },
          bodyFont: { size: 12, family: FONT },
        },
      },
      scales: {
        x: {
          ticks: {
            color: MUTED,
            font: { size: 12, family: FONT },
            maxRotation: 0,
          },
          grid: { color: GRID, drawBorder: false },
          border: { color: GRID },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: MUTED,
            font: { size: 12, family: FONT },
          },
          grid: { color: GRID, drawBorder: false },
          border: { color: GRID },
        },
      },
    }, extra || {});
  }

  function bar(ctx, labels, datasets, opts) {
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
    return new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors || PALETTE,
          borderColor: PANEL,
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
              color: MUTED,
              boxWidth: 12,
              boxHeight: 12,
              padding: 14,
              font: { size: 13, family: FONT },
            },
          },
          tooltip: {
            backgroundColor: "rgba(28,26,23,0.94)",
            titleColor: INK,
            bodyColor: MUTED,
            borderColor: GRID,
            borderWidth: 1,
            padding: 10,
          },
        },
      },
    });
  }

  function hbar(ctx, labels, data, color, label) {
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          label: label || "数值",
          data,
          backgroundColor: color || CORAL,
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
            backgroundColor: "rgba(28,26,23,0.94)",
            titleColor: INK,
            bodyColor: MUTED,
            borderColor: GRID,
            borderWidth: 1,
            padding: 10,
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              color: MUTED,
              precision: 0,
              font: { size: 12, family: DISPLAY },
            },
            grid: { color: GRID, drawBorder: false },
            border: { color: GRID },
          },
          y: {
            ticks: {
              color: INK,
              font: { size: 13, family: FONT },
            },
            grid: { display: false, drawBorder: false },
            border: { color: GRID },
          },
        },
      }),
    });
  }

  return { bar, doughnut, hbar, applyDefaults, CORAL, PALETTE };
})();
