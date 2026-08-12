window.RAExport = (function () {
  const ACCENT = "FFD97757";
  const INK_DARK = "FF141413";
  const INK_LIGHT = "FFFAF9F5";
  const MUTED_LIGHT = "FF5E5D59";
  const MUTED_DARK = "FFB0AEA5";
  const SURFACE_LIGHT = "FFFFFFFF";
  const SURFACE_DARK = "FF262522";
  const HEADER_LIGHT = "FFF0EEE6";
  const HEADER_DARK = "FF30302E";

  function excelTheme() {
    const light = !(window.RADash && RADash.getTheme && RADash.getTheme() === "dark");
    if (light) {
      return {
        ink: INK_DARK,
        muted: MUTED_LIGHT,
        surface: SURFACE_LIGHT,
        header: HEADER_LIGHT,
        accent: ACCENT,
      };
    }
    return {
      ink: INK_LIGHT,
      muted: MUTED_DARK,
      surface: SURFACE_DARK,
      header: HEADER_DARK,
      accent: ACCENT,
    };
  }

  function stamp() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return (
      d.getFullYear() +
      p(d.getMonth() + 1) +
      p(d.getDate()) +
      "-" +
      p(d.getHours()) +
      p(d.getMinutes())
    );
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  async function loadPack() {
    const load = RADash.loadJSON;
    const [strategy, meta, wechat, douyin] = await Promise.all([
      load("data/strategy/synthesis.json"),
      load("data/overview/meta.json"),
      load("data/wechat/overview.json").catch(() => null),
      load("data/douyin/overview.json").catch(() => null),
    ]);
    return { strategy, meta, wechat, douyin, exported_at: new Date().toISOString() };
  }

  function buildMarkdown(pack) {
    const s = pack.strategy || {};
    const lines = [];
    lines.push(`# ${s.title || "红警荣耀策略"}`);
    lines.push("");
    lines.push(`> ${s.subtitle || ""}`);
    lines.push(`> 状态：${s.status || ""} · 版本：${s.version || ""} · 导出：${pack.exported_at}`);
    lines.push("");
    lines.push(s.prop || "");
    lines.push("");
    lines.push("## 研究边界");
    lines.push("");
    lines.push(s.guard || "");
    lines.push("");
    lines.push("## 综合摘要");
    lines.push("");
    (s.summary || []).forEach((f) => {
      lines.push(`### ${f.idx} ${f.title}`);
      lines.push("");
      lines.push(f.text);
      lines.push("");
    });

    (s.sections || []).forEach((sec) => {
      lines.push(`## ${sec.idx} ${sec.title}`);
      lines.push("");
      lines.push(`*${sec.status || "阶段性"} · 置信 ${sec.confidence || "—"}*`);
      lines.push("");
      lines.push(sec.lead || "");
      lines.push("");
      (sec.points || []).forEach((p) => {
        lines.push(`### ${p.title}`);
        lines.push("");
        lines.push(p.text || "");
        lines.push("");
        lines.push(`- 平台：${(p.platforms || []).join(" / ") || "—"}`);
        lines.push(`- 证据：${p.evidence || "—"}`);
        lines.push(`- 可执行：${p.action || "—"}`);
        lines.push("");
      });
      lines.push(`**边界：** ${sec.boundary || "—"}`);
      lines.push("");
    });

    lines.push("## 平台阶段性信号（总览）");
    lines.push("");
    (pack.meta?.stage_signals || []).forEach((sig, i) => {
      lines.push(`### ${String(i + 1).padStart(2, "0")} ${sig.title}`);
      lines.push("");
      lines.push(sig.text || "");
      lines.push("");
      lines.push(`*${sig.kind || "阶段性研究信号"}*`);
      lines.push("");
    });

    if (pack.wechat?.core_findings?.length) {
      lines.push("## 微信核心发现");
      lines.push("");
      pack.wechat.core_findings.forEach((f) => {
        lines.push(`### ${f.idx} ${f.title}`);
        lines.push("");
        lines.push(f.text || "");
        lines.push("");
        lines.push(`- 标签：${f.tag || "阶段性"}`);
        lines.push(`- 证据：${f.evidence || "—"}`);
        lines.push("");
      });
    }

    if (pack.douyin?.stage_signals?.length) {
      lines.push("## 抖音阶段信号");
      lines.push("");
      pack.douyin.stage_signals.forEach((sig) => {
        lines.push(`### ${sig.title}`);
        lines.push("");
        lines.push(sig.text || "");
        lines.push("");
      });
    }

    lines.push("## 下一步");
    lines.push("");
    (s.next_steps || []).forEach((x) => lines.push(`- ${x}`));
    lines.push("");
    lines.push("## 来源");
    lines.push("");
    (s.sources || []).forEach((x) => lines.push(`- ${x}`));
    lines.push("");
    lines.push("---");
    lines.push("*本文件由研究报告导出，阶段性综合，供评审讨论，非最终定稿。*");
    lines.push("");
    return lines.join("\n");
  }

  async function exportMarkdown(pack) {
    const md = buildMarkdown(pack);
    downloadBlob(
      new Blob([md], { type: "text/markdown;charset=utf-8" }),
      `红警荣耀-研究结论-${stamp()}.md`
    );
  }

  function styleHeader(row, count) {
    const th = excelTheme();
    for (let c = 1; c <= count; c++) {
      const cell = row.getCell(c);
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: th.header } };
      cell.font = { bold: true, color: { argb: th.ink }, name: "Microsoft YaHei", size: 11 };
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = {
        bottom: { style: "thin", color: { argb: th.accent } },
      };
    }
    row.height = 22;
  }

  function styleBody(row, count) {
    const th = excelTheme();
    for (let c = 1; c <= count; c++) {
      const cell = row.getCell(c);
      cell.font = { color: { argb: th.ink }, name: "Microsoft YaHei", size: 10 };
      cell.alignment = { vertical: "top", wrapText: true };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: th.surface } };
    }
  }

  async function exportExcel(pack) {
    if (typeof ExcelJS === "undefined") {
      throw new Error("ExcelJS 未加载");
    }
    const wb = new ExcelJS.Workbook();
    wb.creator = "红警荣耀内容研究";
    wb.created = new Date();

    const s = pack.strategy || {};

    // Cover
    {
      const ws = wb.addWorksheet("封面", {
        properties: { defaultRowHeight: 18, tabColor: { argb: ACCENT } },
      });
      ws.columns = [{ width: 22 }, { width: 72 }];
      const rows = [
        ["文档", s.title || "红警荣耀策略"],
        ["副标题", s.subtitle || ""],
        ["状态", s.status || ""],
        ["版本", s.version || ""],
        ["导出时间", pack.exported_at],
        ["主题", (window.RADash && RADash.getTheme && RADash.getTheme()) || "light"],
        ["说明", s.prop || ""],
        ["研究边界", s.guard || ""],
      ];
      const th = excelTheme();
      rows.forEach((r, i) => {
        const row = ws.addRow(r);
        row.getCell(1).font = { bold: true, color: { argb: th.accent }, name: "Microsoft YaHei", size: 11 };
        row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: th.header } };
        row.getCell(2).font = { color: { argb: th.ink }, name: "Microsoft YaHei", size: 11 };
        row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: th.surface } };
        row.getCell(2).alignment = { wrapText: true, vertical: "top" };
        if (i >= 6) row.height = 64;
      });
    }

    // Summary
    {
      const ws = wb.addWorksheet("综合摘要", { properties: { tabColor: { argb: ACCENT } } });
      ws.columns = [
        { header: "编号", key: "idx", width: 10 },
        { header: "标题", key: "title", width: 28 },
        { header: "结论", key: "text", width: 64 },
      ];
      styleHeader(ws.getRow(1), 3);
      (s.summary || []).forEach((f) => {
        const row = ws.addRow({ idx: f.idx, title: f.title, text: f.text });
        styleBody(row, 3);
        row.height = 36;
      });
      ws.views = [{ state: "frozen", ySplit: 1 }];
    }

    // Each strategy section
    (s.sections || []).forEach((sec) => {
      const name = `${sec.idx}${sec.title}`.slice(0, 31);
      const ws = wb.addWorksheet(name, { properties: { tabColor: { argb: ACCENT } } });
      ws.columns = [
        { header: "要点", key: "title", width: 24 },
        { header: "结论", key: "text", width: 40 },
        { header: "平台", key: "platforms", width: 18 },
        { header: "证据", key: "evidence", width: 36 },
        { header: "可执行", key: "action", width: 36 },
      ];
      styleHeader(ws.getRow(1), 5);
      const lead = ws.addRow({
        title: "导语",
        text: sec.lead || "",
        platforms: `置信 ${sec.confidence || "—"}`,
        evidence: sec.status || "阶段性",
        action: sec.boundary || "",
      });
      styleBody(lead, 5);
      lead.font = { italic: true, color: { argb: excelTheme().muted }, name: "Microsoft YaHei", size: 10 };
      lead.height = 40;
      (sec.points || []).forEach((p) => {
        const row = ws.addRow({
          title: p.title,
          text: p.text,
          platforms: (p.platforms || []).join(" / "),
          evidence: p.evidence,
          action: p.action,
        });
        styleBody(row, 5);
        row.height = 48;
      });
      ws.views = [{ state: "frozen", ySplit: 1 }];
    });

    // Platform signals
    {
      const ws = wb.addWorksheet("平台信号", { properties: { tabColor: { argb: "FF7AA2C4" } } });
      ws.columns = [
        { header: "来源", key: "src", width: 12 },
        { header: "标题", key: "title", width: 32 },
        { header: "内容", key: "text", width: 56 },
        { header: "类型", key: "kind", width: 18 },
      ];
      styleHeader(ws.getRow(1), 4);
      (pack.meta?.stage_signals || []).forEach((sig) => {
        const row = ws.addRow({
          src: "总览",
          title: sig.title,
          text: sig.text,
          kind: sig.kind || "阶段信号",
        });
        styleBody(row, 4);
        row.height = 40;
      });
      (pack.wechat?.core_findings || []).forEach((f) => {
        const row = ws.addRow({
          src: "微信",
          title: `${f.idx} ${f.title}`,
          text: f.text,
          kind: f.tag || "阶段性",
        });
        styleBody(row, 4);
        row.height = 40;
      });
      (pack.douyin?.stage_signals || []).forEach((sig) => {
        const row = ws.addRow({
          src: "抖音",
          title: sig.title,
          text: sig.text,
          kind: sig.kind || "阶段信号",
        });
        styleBody(row, 4);
        row.height = 40;
      });
      ws.views = [{ state: "frozen", ySplit: 1 }];
    }

    // Next steps
    {
      const ws = wb.addWorksheet("下一步", { properties: { tabColor: { argb: "FF5DB8A6" } } });
      ws.columns = [
        { header: "#", key: "n", width: 6 },
        { header: "事项", key: "item", width: 72 },
      ];
      styleHeader(ws.getRow(1), 2);
      (s.next_steps || []).forEach((item, i) => {
        const row = ws.addRow({ n: i + 1, item });
        styleBody(row, 2);
      });
    }

    const buf = await wb.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `红警荣耀-研究结论-${stamp()}.xlsx`
    );
  }

  function openPdfPrint() {
    const prefix = RADash.depthPrefix();
    // PDF print forces light for readability; pass current theme for screen preview only
    const url = prefix + "insights/export-print.html?auto=1&theme=light";
    window.open(url, "_blank", "noopener");
  }

  function ensurePanel() {
    let panel = document.getElementById("exportPanel");
    if (panel) return panel;
    panel = document.createElement("div");
    panel.id = "exportPanel";
    panel.className = "export-panel";
    panel.hidden = true;
    panel.innerHTML = `
      <div class="export-panel-card" role="dialog" aria-label="导出结论">
        <div class="export-panel-head">
          <strong>导出结论</strong>
          <button type="button" class="export-close" aria-label="关闭">×</button>
        </div>
        <p class="export-hint">包含内容策略综合、总览信号、微信核心发现与抖音阶段信号。</p>
        <div class="export-actions">
          <button type="button" class="btn" data-fmt="pdf">导出 PDF</button>
          <button type="button" class="btn" data-fmt="xlsx">导出 Excel</button>
          <button type="button" class="btn ghost" data-fmt="md">导出 Markdown</button>
        </div>
        <p class="export-status faint" id="exportStatus"></p>
      </div>`;
    document.body.appendChild(panel);
    panel.querySelector(".export-close").onclick = () => {
      panel.hidden = true;
    };
    panel.addEventListener("click", (e) => {
      if (e.target === panel) panel.hidden = true;
    });
    panel.querySelectorAll("[data-fmt]").forEach((btn) => {
      btn.addEventListener("click", () => runExport(btn.getAttribute("data-fmt")));
    });
    return panel;
  }

  async function runExport(fmt) {
    const status = document.getElementById("exportStatus");
    const set = (t) => {
      if (status) status.textContent = t;
    };
    try {
      if (fmt === "pdf") {
        set("正在打开 PDF 排版页…");
        openPdfPrint();
        set("已打开打印页：请选择「另存为 PDF」。");
        return;
      }
      set("正在组装结论包…");
      const pack = await loadPack();
      if (fmt === "md") {
        set("正在生成 Markdown…");
        await exportMarkdown(pack);
        set("Markdown 已下载。");
      } else if (fmt === "xlsx") {
        set("正在生成 Excel…");
        await ensureExcelJS();
        await exportExcel(pack);
        set("Excel 已下载。");
      }
    } catch (err) {
      set("导出失败：" + err.message);
      console.error(err);
    }
  }

  function ensureExcelJS() {
    if (typeof ExcelJS !== "undefined") return Promise.resolve();
    return new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";
      s.onload = () => resolve();
      s.onerror = () => reject(new Error("ExcelJS CDN 加载失败"));
      document.head.appendChild(s);
    });
  }

  function mount(selector) {
    const host = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!host) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn";
    btn.textContent = "导出结论";
    btn.addEventListener("click", () => {
      const panel = ensurePanel();
      panel.hidden = false;
    });
    host.appendChild(btn);
  }

  function mountNavExport() {
    const wrap = document.querySelector(".nav-export");
    if (!wrap || wrap.querySelector(".nav-export-btn")) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn ghost nav-export-btn";
    btn.textContent = "导出";
    btn.addEventListener("click", () => {
      const panel = ensurePanel();
      panel.hidden = false;
    });
    wrap.appendChild(btn);
  }

  return {
    loadPack,
    buildMarkdown,
    exportMarkdown,
    exportExcel,
    openPdfPrint,
    mount,
    mountNavExport,
    runExport,
  };
})();
