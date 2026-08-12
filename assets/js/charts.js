window.RACharts = (function () {
  function bar(ctx, labels, datasets, opts) {
    return new Chart(ctx, {
      type: "bar",
      data: { labels, datasets },
      options: Object.assign({
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { beginAtZero: true } },
      }, opts || {}),
    });
  }

  function doughnut(ctx, labels, data, colors) {
    return new Chart(ctx, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{ data, backgroundColor: colors || ["#c45c26", "#4f8cff", "#2bbbad", "#8b5cf6", "#c9a227", "#6b7a8a"] }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: "bottom" } },
      },
    });
  }

  function hbar(ctx, labels, data, color, label) {
    return new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [{ label: label || "数值", data, backgroundColor: color || "#c45c26" }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } },
      },
    });
  }

  return { bar, doughnut, hbar };
})();
