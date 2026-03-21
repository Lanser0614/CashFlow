const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");
const { Canvas, loadImage } = require("skia-canvas");
const { autoFontSize, calcTextBox } = require("./pptxgenjs_helpers/text");
const { imageSizingContain } = require("./pptxgenjs_helpers/image");
const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require("./pptxgenjs_helpers/layout");

const OUT_DIR = path.join(__dirname, "build");
const OUT_FILE = path.join(OUT_DIR, "kubernetes-week-1-hour.pptx");
const ASSET_DIR = path.join(__dirname, "assets");

const FONT = "Arial";
const MONO = "Menlo";
const W = 13.333;
const H = 7.5;

const COLORS = {
  bg: "F8FAFC",
  panel: "FFFFFF",
  ink: "0F172A",
  text: "1E293B",
  muted: "475569",
  soft: "64748B",
  line: "D9E3F0",
  blue: "2563EB",
  blueSoft: "DBEAFE",
  teal: "0F766E",
  tealSoft: "CCFBF1",
  amber: "D97706",
  amberSoft: "FEF3C7",
  rose: "E11D48",
  roseSoft: "FFE4E6",
  violet: "7C3AED",
  violetSoft: "EDE9FE",
  slateSoft: "E2E8F0",
};

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(ASSET_DIR, { recursive: true });
}

function addBackdrop(slide, accent = COLORS.blue) {
  slide.background = { color: COLORS.bg };
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: W,
    h: 0.16,
    line: { color: accent, transparency: 100 },
    fill: { color: accent },
  });
}

function addHeader(slide, eyebrow, title, subtitle, accent = COLORS.blue) {
  slide.addText(eyebrow.toUpperCase(), {
    x: 0.7,
    y: 0.42,
    w: 2.8,
    h: 0.22,
    fontFace: FONT,
    fontSize: 10,
    bold: true,
    color: accent,
    charSpace: 1.2,
    margin: 0,
  });
  slide.addText(
    title,
    autoFontSize(title, FONT, {
      x: 0.7,
      y: 0.72,
      w: 8.6,
      h: 0.62,
      minFontSize: 23,
      maxFontSize: 28,
      bold: true,
      color: COLORS.ink,
      margin: 0,
    })
  );
  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.7,
      y: 1.38,
      w: 9.2,
      h: 0.34,
      fontFace: FONT,
      fontSize: 11,
      color: COLORS.muted,
      margin: 0,
    });
  }
}

function addFooter(slide, text) {
  slide.addText(text, {
    x: 0.72,
    y: 7.04,
    w: 3.6,
    h: 0.16,
    fontFace: FONT,
    fontSize: 8.5,
    color: COLORS.soft,
    margin: 0,
  });
}

function addPanel(slide, x, y, w, h, title, opts = {}) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    rectRadius: 0.08,
    line: { color: opts.border || COLORS.line, pt: 1.1 },
    fill: { color: opts.fill || COLORS.panel },
  });
  if (title) {
    slide.addText(title, {
      x: x + 0.2,
      y: y + 0.16,
      w: w - 0.4,
      h: 0.18,
      fontFace: FONT,
      fontSize: 12,
      bold: true,
      color: COLORS.ink,
      margin: 0,
    });
  }
}

function addBulletList(slide, items, box, opts = {}) {
  const fontSize = opts.fontSize || 14;
  const runs = items.map((item, index) => ({
    text: item,
    options: {
      bullet: { indent: 15 },
      breakLine: index !== items.length - 1,
      paraSpaceAfterPt: opts.paraSpaceAfterPt || 5,
    },
  }));
  const fitted = autoFontSize(runs, FONT, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fontSize,
    minFontSize: opts.minFontSize || Math.max(11, fontSize - 2),
    maxFontSize: fontSize,
    color: opts.color || COLORS.text,
    margin: 0,
    valign: "top",
    mode: "shrink",
  });
  slide.addText(runs, fitted);
}

function addParagraph(slide, text, box, opts = {}) {
  const fontSize = opts.fontSize || 14;
  const measured = calcTextBox(fontSize, {
    text,
    w: box.w,
    fontFace: FONT,
    margin: 0,
  });
  slide.addText(text, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: Math.min(box.h, measured.h + 0.08),
    fontFace: FONT,
    fontSize,
    color: opts.color || COLORS.text,
    margin: 0,
    valign: opts.valign || "top",
    align: opts.align || "left",
  });
}

function addTag(slide, x, y, w, text, opts = {}) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h: 0.32,
    rectRadius: 0.06,
    line: { color: opts.fill || COLORS.blueSoft, pt: 1 },
    fill: { color: opts.fill || COLORS.blueSoft },
  });
  slide.addText(text, {
    x: x + 0.08,
    y: y + 0.085,
    w: w - 0.16,
    h: 0.12,
    fontFace: FONT,
    fontSize: 9.5,
    color: opts.color || COLORS.blue,
    bold: true,
    margin: 0,
    align: "center",
  });
}

function addCard(slide, x, y, w, h, title, text, accent, fill) {
  addPanel(slide, x, y, w, h, "", { border: accent, fill });
  slide.addText(title, {
    x: x + 0.18,
    y: y + 0.18,
    w: w - 0.36,
    h: 0.18,
    fontFace: FONT,
    fontSize: 12,
    bold: true,
    color: accent,
    margin: 0,
  });
  addParagraph(slide, text, { x: x + 0.18, y: y + 0.48, w: w - 0.36, h: h - 0.6 }, {
    fontSize: 12.5,
  });
}

function addTimelineStep(slide, x, y, w, title, mins, text, accent, fill) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h: 0.94,
    rectRadius: 0.06,
    line: { color: accent, pt: 1.1 },
    fill: { color: fill },
  });
  slide.addText(mins, {
    x: x + 0.14,
    y: y + 0.14,
    w: 0.72,
    h: 0.16,
    fontFace: FONT,
    fontSize: 10,
    bold: true,
    color: accent,
    margin: 0,
  });
  slide.addText(title, {
    x: x + 0.14,
    y: y + 0.33,
    w: w - 0.28,
    h: 0.16,
    fontFace: FONT,
    fontSize: 12,
    bold: true,
    color: COLORS.ink,
    margin: 0,
  });
  addParagraph(slide, text, { x: x + 0.14, y: y + 0.53, w: w - 0.28, h: 0.24 }, {
    fontSize: 10.5,
    color: COLORS.muted,
  });
}

function makePainSvg() {
  return `
    <svg width="560" height="260" viewBox="0 0 560 260" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="18" width="536" height="224" rx="24" fill="#FFFFFF" stroke="#D9E3F0" stroke-width="3"/>
      <rect x="34" y="52" width="208" height="152" rx="18" fill="#FFE4E6" stroke="#FB7185" stroke-width="2"/>
      <text x="138" y="82" font-family="Arial" font-size="22" font-weight="700" text-anchor="middle" fill="#BE123C">Без оркестратора</text>
      <text x="52" y="114" font-family="Arial" font-size="15" fill="#334155">• ручной restart и redeploy</text>
      <text x="52" y="140" font-family="Arial" font-size="15" fill="#334155">• где запущен сервис знает только команда</text>
      <text x="52" y="166" font-family="Arial" font-size="15" fill="#334155">• масштабирование болезненно и вручную</text>
      <rect x="318" y="52" width="208" height="152" rx="18" fill="#DBEAFE" stroke="#60A5FA" stroke-width="2"/>
      <text x="422" y="82" font-family="Arial" font-size="22" font-weight="700" text-anchor="middle" fill="#1D4ED8">С Kubernetes</text>
      <text x="336" y="114" font-family="Arial" font-size="15" fill="#334155">• desired state описан декларативно</text>
      <text x="336" y="140" font-family="Arial" font-size="15" fill="#334155">• платформа сама лечит сбои</text>
      <text x="336" y="166" font-family="Arial" font-size="15" fill="#334155">• rollout и scale стандартизованы</text>
      <path d="M250 128 L310 128" stroke="#94A3B8" stroke-width="4"/>
      <polygon points="306,120 324,128 306,136" fill="#94A3B8"/>
    </svg>
  `;
}

function makeBigPictureSvg() {
  return `
    <svg width="560" height="290" viewBox="0 0 560 290" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="16" width="532" height="258" rx="24" fill="#EFF6FF" stroke="#93C5FD" stroke-width="3"/>
      <text x="280" y="42" font-family="Arial" font-size="22" font-weight="700" text-anchor="middle" fill="#1D4ED8">Kubernetes Cluster</text>
      <rect x="40" y="70" width="150" height="110" rx="16" fill="#DBEAFE" stroke="#60A5FA" stroke-width="2"/>
      <text x="115" y="99" font-family="Arial" font-size="19" font-weight="700" text-anchor="middle" fill="#1D4ED8">Control Plane</text>
      <text x="115" y="126" font-family="Arial" font-size="13" text-anchor="middle" fill="#334155">API Server</text>
      <text x="115" y="146" font-family="Arial" font-size="13" text-anchor="middle" fill="#334155">Scheduler</text>
      <text x="115" y="166" font-family="Arial" font-size="13" text-anchor="middle" fill="#334155">Controllers</text>
      <rect x="228" y="68" width="128" height="176" rx="16" fill="#FFFFFF" stroke="#A7F3D0" stroke-width="2"/>
      <rect x="378" y="68" width="128" height="176" rx="16" fill="#FFFFFF" stroke="#A7F3D0" stroke-width="2"/>
      <text x="292" y="96" font-family="Arial" font-size="18" font-weight="700" text-anchor="middle" fill="#0F766E">Worker Node A</text>
      <text x="442" y="96" font-family="Arial" font-size="18" font-weight="700" text-anchor="middle" fill="#0F766E">Worker Node B</text>
      <rect x="250" y="118" width="84" height="34" rx="10" fill="#CCFBF1"/>
      <rect x="250" y="162" width="84" height="34" rx="10" fill="#CCFBF1"/>
      <rect x="400" y="118" width="84" height="34" rx="10" fill="#CCFBF1"/>
      <rect x="400" y="162" width="84" height="34" rx="10" fill="#CCFBF1"/>
      <text x="292" y="140" font-family="Arial" font-size="14" text-anchor="middle" fill="#115E59">Pod</text>
      <text x="292" y="184" font-family="Arial" font-size="14" text-anchor="middle" fill="#115E59">Pod</text>
      <text x="442" y="140" font-family="Arial" font-size="14" text-anchor="middle" fill="#115E59">Pod</text>
      <text x="442" y="184" font-family="Arial" font-size="14" text-anchor="middle" fill="#115E59">Pod</text>
      <path d="M190 124 C212 124, 216 124, 228 124" stroke="#60A5FA" stroke-width="3" fill="none"/>
      <path d="M190 124 C250 124, 320 124, 378 124" stroke="#60A5FA" stroke-width="3" fill="none"/>
      <text x="280" y="256" font-family="Arial" font-size="13" text-anchor="middle" fill="#334155">control plane принимает решения, worker nodes исполняют workload</text>
    </svg>
  `;
}

function makeNodeSvg() {
  return `
    <svg width="520" height="280" viewBox="0 0 520 280" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="18" width="488" height="244" rx="24" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="3"/>
      <text x="260" y="44" font-family="Arial" font-size="22" font-weight="700" text-anchor="middle" fill="#0F172A">Worker Node</text>
      <rect x="42" y="66" width="120" height="164" rx="18" fill="#DBEAFE" stroke="#60A5FA" stroke-width="2"/>
      <text x="102" y="94" font-family="Arial" font-size="18" font-weight="700" text-anchor="middle" fill="#1D4ED8">Node OS</text>
      <text x="102" y="122" font-family="Arial" font-size="14" text-anchor="middle" fill="#334155">Linux</text>
      <text x="102" y="146" font-family="Arial" font-size="14" text-anchor="middle" fill="#334155">networking</text>
      <text x="102" y="170" font-family="Arial" font-size="14" text-anchor="middle" fill="#334155">cgroups / namespaces</text>
      <rect x="192" y="66" width="132" height="164" rx="18" fill="#CCFBF1" stroke="#2DD4BF" stroke-width="2"/>
      <text x="258" y="94" font-family="Arial" font-size="18" font-weight="700" text-anchor="middle" fill="#0F766E">Node Agents</text>
      <text x="258" y="122" font-family="Arial" font-size="14" text-anchor="middle" fill="#334155">kubelet</text>
      <text x="258" y="146" font-family="Arial" font-size="14" text-anchor="middle" fill="#334155">kube-proxy</text>
      <text x="258" y="170" font-family="Arial" font-size="14" text-anchor="middle" fill="#334155">container runtime</text>
      <rect x="356" y="66" width="120" height="164" rx="18" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
      <text x="416" y="94" font-family="Arial" font-size="18" font-weight="700" text-anchor="middle" fill="#B45309">Workloads</text>
      <rect x="378" y="118" width="76" height="28" rx="10" fill="#FFFFFF"/>
      <rect x="378" y="156" width="76" height="28" rx="10" fill="#FFFFFF"/>
      <text x="416" y="136" font-family="Arial" font-size="14" text-anchor="middle" fill="#92400E">Pod</text>
      <text x="416" y="174" font-family="Arial" font-size="14" text-anchor="middle" fill="#92400E">Pod</text>
    </svg>
  `;
}

function makeControlLoopSvg() {
  return `
    <svg width="560" height="220" viewBox="0 0 560 220" xmlns="http://www.w3.org/2000/svg">
      <rect x="16" y="20" width="528" height="180" rx="24" fill="#FFFFFF" stroke="#D9E3F0" stroke-width="3"/>
      <rect x="34" y="76" width="96" height="60" rx="16" fill="#DBEAFE" stroke="#60A5FA" stroke-width="2"/>
      <rect x="164" y="76" width="96" height="60" rx="16" fill="#EDE9FE" stroke="#A78BFA" stroke-width="2"/>
      <rect x="294" y="76" width="96" height="60" rx="16" fill="#FEF3C7" stroke="#F59E0B" stroke-width="2"/>
      <rect x="424" y="76" width="96" height="60" rx="16" fill="#CCFBF1" stroke="#2DD4BF" stroke-width="2"/>
      <text x="82" y="103" font-family="Arial" font-size="16" font-weight="700" text-anchor="middle" fill="#1D4ED8">YAML</text>
      <text x="82" y="122" font-family="Arial" font-size="12" text-anchor="middle" fill="#334155">desired state</text>
      <text x="212" y="103" font-family="Arial" font-size="16" font-weight="700" text-anchor="middle" fill="#6D28D9">API Server</text>
      <text x="212" y="122" font-family="Arial" font-size="12" text-anchor="middle" fill="#334155">сохраняет intent</text>
      <text x="342" y="103" font-family="Arial" font-size="16" font-weight="700" text-anchor="middle" fill="#B45309">Controllers</text>
      <text x="342" y="122" font-family="Arial" font-size="12" text-anchor="middle" fill="#334155">ищут отклонения</text>
      <text x="472" y="103" font-family="Arial" font-size="16" font-weight="700" text-anchor="middle" fill="#0F766E">kubelet</text>
      <text x="472" y="122" font-family="Arial" font-size="12" text-anchor="middle" fill="#334155">запускает Pods</text>
      <path d="M130 106 L164 106" stroke="#94A3B8" stroke-width="4"/>
      <path d="M260 106 L294 106" stroke="#94A3B8" stroke-width="4"/>
      <path d="M390 106 L424 106" stroke="#94A3B8" stroke-width="4"/>
      <polygon points="158,98 174,106 158,114" fill="#94A3B8"/>
      <polygon points="288,98 304,106 288,114" fill="#94A3B8"/>
      <polygon points="418,98 434,106 418,114" fill="#94A3B8"/>
      <text x="280" y="172" font-family="Arial" font-size="14" text-anchor="middle" fill="#334155">цикл reconciliation повторяется постоянно, а не один раз во время deploy</text>
    </svg>
  `;
}

async function writeSvgPng(filename, svg, width, height) {
  const outputPath = path.join(ASSET_DIR, filename);
  const dataUri =
    "data:image/svg+xml;base64," + Buffer.from(svg, "utf8").toString("base64");
  const image = await loadImage(dataUri);
  const canvas = new Canvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(image, 0, 0, width, height);
  fs.writeFileSync(outputPath, await canvas.toBuffer("png"));
  return outputPath;
}

async function ensureDiagramAssets() {
  return {
    pain: await writeSvgPng("pain-comparison.png", makePainSvg(), 560, 260),
    bigPicture: await writeSvgPng(
      "big-picture.png",
      makeBigPictureSvg(),
      560,
      290
    ),
    node: await writeSvgPng("worker-node.png", makeNodeSvg(), 520, 280),
    controlLoop: await writeSvgPng(
      "control-loop.png",
      makeControlLoopSvg(),
      560,
      220
    ),
  };
}

function finalizeSlide(slide, pptx, label) {
  addFooter(slide, label);
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function addTitleSlide(pptx) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.blue);
  addTag(slide, 0.74, 0.56, 2.22, "Kubernetes Knowledge Sharing", {
    fill: COLORS.blueSoft,
    color: COLORS.blue,
  });
  slide.addText("Неделя 1", {
    x: 0.74,
    y: 1.1,
    w: 1.4,
    h: 0.2,
    fontFace: FONT,
    fontSize: 12,
    bold: true,
    color: COLORS.blue,
    margin: 0,
  });
  slide.addText(
    "Зачем Kubernetes?",
    autoFontSize("Зачем Kubernetes?", FONT, {
      x: 0.74,
      y: 1.34,
      w: 4.9,
      h: 0.72,
      minFontSize: 28,
      maxFontSize: 34,
      bold: true,
      color: COLORS.ink,
      margin: 0,
    })
  );
  slide.addText("Расширенная сессия на 60 минут", {
    x: 0.74,
    y: 2.12,
    w: 3.8,
    h: 0.28,
    fontFace: FONT,
    fontSize: 18,
    bold: true,
    color: COLORS.blue,
    margin: 0,
  });
  addParagraph(
    slide,
    "Эта версия рассчитана на полноценный knowledge-sharing slot: с объяснением big picture, терминов, архитектурных ролей кластера и демонстрацией через kubectl.",
    { x: 0.74, y: 2.64, w: 5.5, h: 0.9 },
    { fontSize: 15 }
  );
  addPanel(slide, 0.74, 3.92, 5.62, 1.72, "К концу часа участник сможет", {
    border: COLORS.line,
  });
  addBulletList(
    slide,
    [
      "объяснить, какую проблему Kubernetes решает для команды",
      "нарисовать на доске cluster, node и control plane",
      "показать базовый обход кластера через `kubectl`",
    ],
    { x: 0.98, y: 4.3, w: 5.1, h: 1.0 },
    { fontSize: 14 }
  );
  addPanel(slide, 6.76, 0.84, 5.78, 5.46, "Структура занятия", {
    border: COLORS.line,
  });
  addTimelineStep(slide, 7.02, 1.24, 2.48, "Контекст", "0-10 мин", "почему оркестрация вообще стала нужна", COLORS.blue, COLORS.blueSoft);
  addTimelineStep(slide, 9.76, 1.24, 2.48, "Big picture", "10-25 мин", "из чего состоит кластер и кто принимает решения", COLORS.teal, COLORS.tealSoft);
  addTimelineStep(slide, 7.02, 2.44, 2.48, "Cluster + Node", "25-40 мин", "разбираем роли control plane и worker node", COLORS.violet, COLORS.violetSoft);
  addTimelineStep(slide, 9.76, 2.44, 2.48, "Демо", "40-52 мин", "kubectl, nodes, pods, describe, events", COLORS.amber, COLORS.amberSoft);
  addTimelineStep(slide, 8.39, 3.64, 2.48, "Итоги", "52-60 мин", "takeaways, вопросы, homework", COLORS.rose, COLORS.roseSoft);
  finalizeSlide(slide, pptx, "Неделя 1 — расширенная сессия");
}

function addGoalsSlide(pptx) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.blue);
  addHeader(slide, "Цели", "Чего мы хотим добиться за этот час", "Сначала выравниваем ожидания: что участники должны понять, а что пока сознательно не разбираем.", COLORS.blue);
  addCard(
    slide,
    0.74,
    2.0,
    3.82,
    2.2,
    "Понять",
    "Почему Kubernetes нужен не из-за моды, а из-за реальных operational-проблем: scaling, self-healing, repeatable deploys и прозрачность инфраструктуры.",
    COLORS.blue,
    COLORS.blueSoft
  );
  addCard(
    slide,
    4.76,
    2.0,
    3.82,
    2.2,
    "Научиться объяснять",
    "Что такое cluster, node, control plane, desired state и почему разработчику полезно знать эту модель, даже если платформой занимается другая команда.",
    COLORS.teal,
    COLORS.tealSoft
  );
  addCard(
    slide,
    8.78,
    2.0,
    3.82,
    2.2,
    "Уметь показать руками",
    "Как локально посмотреть состояние кластера, список нод, список подов и события, чтобы термины сразу связывались с реальным CLI и реальным окружением.",
    COLORS.amber,
    COLORS.amberSoft
  );
  addPanel(slide, 0.74, 4.66, 11.86, 1.24, "Что не входит в первую неделю", {
    border: COLORS.line,
  });
  addBulletList(
    slide,
    [
      "не идем глубоко в YAML и workload-объекты",
      "не обсуждаем production-grade networking и security hardening",
      "не пытаемся заменить весь курс одной вводной лекцией",
    ],
    { x: 0.98, y: 5.04, w: 11.3, h: 0.54 },
    { fontSize: 13, minFontSize: 12 }
  );
  finalizeSlide(slide, pptx, "Цели");
}

function addProgramSlide(pptx) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.teal);
  addHeader(slide, "Программа", "Поминутный план на 60 минут", "Эта структура помогает держать темп и не утонуть в деталях раньше времени.", COLORS.teal);
  const steps = [
    ["00-05", "Разогрев", "собираем контекст команды: где уже болит деплой и масштабирование", COLORS.blue, COLORS.blueSoft],
    ["05-15", "Почему Kubernetes", "разбираем ограничения single host, docker-compose и ручных операций", COLORS.rose, COLORS.roseSoft],
    ["15-25", "Big picture", "рисуем control plane, worker nodes и desired state loop", COLORS.violet, COLORS.violetSoft],
    ["25-35", "Что такое cluster", "понятие кластера, API, scheduler, controllers, shared state", COLORS.blue, COLORS.blueSoft],
    ["35-42", "Что такое node", "node OS, kubelet, kube-proxy, container runtime, Pods", COLORS.teal, COLORS.tealSoft],
    ["42-52", "Живое демо", "kubectl get nodes, get pods -A, describe node, события и namespace", COLORS.amber, COLORS.amberSoft],
    ["52-60", "Итоги и homework", "фиксируем takeaways и ожидания к следующей неделе", COLORS.blue, COLORS.blueSoft],
  ];
  steps.forEach((step, index) => {
    const y = 1.96 + index * 0.68;
    slide.addShape("roundRect", {
      x: 0.82,
      y,
      w: 11.7,
      h: 0.56,
      rectRadius: 0.05,
      line: { color: step[3], pt: 1 },
      fill: { color: step[4] },
    });
    slide.addText(step[0], {
      x: 1.02,
      y: y + 0.17,
      w: 0.82,
      h: 0.14,
      fontFace: MONO,
      fontSize: 10,
      bold: true,
      color: step[3],
      margin: 0,
      align: "center",
    });
    slide.addText(step[1], {
      x: 2.08,
      y: y + 0.13,
      w: 2.4,
      h: 0.16,
      fontFace: FONT,
      fontSize: 12,
      bold: true,
      color: COLORS.ink,
      margin: 0,
    });
    addParagraph(slide, step[2], { x: 4.64, y: y + 0.12, w: 7.56, h: 0.22 }, {
      fontSize: 11.2,
      color: COLORS.muted,
    });
  });
  finalizeSlide(slide, pptx, "Программа");
}

function addWhySlide(pptx, assets) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.rose);
  addHeader(slide, "Зачем Kubernetes", "С какой проблемой Kubernetes приходит в команду", "Говорим не про технологию ради технологии, а про pain points, которые повторяются почти в любой продуктовой команде.", COLORS.rose);
  addPanel(slide, 0.74, 1.96, 5.08, 3.7, "Типичные боли без оркестратора", {
    border: COLORS.rose,
    fill: COLORS.panel,
  });
  addBulletList(
    slide,
    [
      "сервис живет на конкретной машине, и это знание легко теряется",
      "падение процесса лечится руками или самописными костылями",
      "масштабирование означает ручной запуск новых экземпляров",
      "rollout каждый раз придумывается заново под конкретный проект",
      "конфиг, секреты и routing живут в разных местах и без единой модели",
    ],
    { x: 0.98, y: 2.34, w: 4.56, h: 2.86 },
    { fontSize: 14 }
  );
  slide.addImage({
    path: assets.pain,
    ...imageSizingContain(assets.pain, 6.08, 2.0, 6.18, 2.84),
  });
  addPanel(slide, 6.08, 5.02, 6.18, 0.96, "Короткий тезис", {
    border: COLORS.line,
    fill: COLORS.roseSoft,
  });
  addParagraph(
    slide,
    "Kubernetes стандартизует deploy и эксплуатацию: ты описываешь желаемое состояние, а платформа стремится его поддерживать.",
    { x: 6.34, y: 5.36, w: 5.66, h: 0.26 },
    { fontSize: 13.2 }
  );
  finalizeSlide(slide, pptx, "Почему Kubernetes");
}

function addBigPictureSlide(pptx, assets) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.blue);
  addHeader(slide, "Big Picture", "Как выглядит Kubernetes сверху", "Сейчас цель не выучить все компоненты, а понять разделение ролей: кто принимает решения и кто исполняет workload.", COLORS.blue);
  slide.addImage({
    path: assets.bigPicture,
    ...imageSizingContain(assets.bigPicture, 0.82, 1.96, 6.36, 3.78),
  });
  addPanel(slide, 7.54, 2.0, 5.04, 3.74, "Как читать схему", {
    border: COLORS.line,
  });
  addBulletList(
    slide,
    [
      "control plane хранит и интерпретирует желаемое состояние",
      "scheduler решает, на какую ноду поставить Pod",
      "controller loops сверяют факт и intent",
      "worker nodes запускают контейнеры и отчитываются о состоянии",
      "разработчик чаще всего взаимодействует с API, а не с машинами напрямую",
    ],
    { x: 7.8, y: 2.38, w: 4.52, h: 2.68 },
    { fontSize: 14 }
  );
  finalizeSlide(slide, pptx, "Big picture");
}

function addTopicsSlide(pptx) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.violet);
  addHeader(slide, "Ключевые темы", "Словарь, который должен закрепиться после первой недели", "Если эти термины стали интуитивными, то дальше Pod, Deployment и Service лягут намного проще.", COLORS.violet);
  const cards = [
    ["Desired state", "мы описываем желаемый результат, а не последовательность ручных шагов", COLORS.blue, COLORS.blueSoft],
    ["Reconciliation", "контроллеры непрерывно выравнивают факт с описанием в API", COLORS.teal, COLORS.tealSoft],
    ["Cluster", "набор узлов и control plane, работающих как единая платформа", COLORS.violet, COLORS.violetSoft],
    ["Node", "отдельная машина, на которой реально запускаются Pods", COLORS.amber, COLORS.amberSoft],
    ["API-centric model", "взаимодействуем через kubectl и API Server, а не логинимся по SSH везде подряд", COLORS.blue, COLORS.blueSoft],
    ["Self-healing", "система замечает отклонения и пытается вернуть рабочее состояние", COLORS.rose, COLORS.roseSoft],
  ];
  cards.forEach((card, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    addCard(
      slide,
      0.82 + col * 4.16,
      2.0 + row * 1.72,
      3.78,
      1.42,
      card[0],
      card[1],
      card[2],
      card[3]
    );
  });
  finalizeSlide(slide, pptx, "Ключевые темы");
}

function addClusterSlide(pptx, assets) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.blue);
  addHeader(slide, "Что такое кластер", "Кластер как единая точка исполнения и управления", "Важно донести, что кластер это не просто “несколько серверов”, а согласованная система с общим control plane и API.", COLORS.blue);
  addPanel(slide, 0.74, 1.98, 4.2, 3.86, "Определение", { border: COLORS.line });
  addParagraph(
    slide,
    "Кластер Kubernetes это набор машин, объединенных общим control plane. Для пользователя он выглядит как единая вычислительная платформа, в которую можно отправить описание приложения и ожидать, что платформа сама разместит, перезапустит и отследит workload.",
    { x: 0.98, y: 2.34, w: 3.72, h: 1.34 },
    { fontSize: 13.3 }
  );
  addBulletList(
    slide,
    [
      "есть единый API",
      "есть общая модель состояния",
      "есть распределение workload по nodes",
      "есть стандартный способ наблюдать статус",
    ],
    { x: 0.98, y: 3.92, w: 3.56, h: 1.36 },
    { fontSize: 13.5 }
  );
  slide.addImage({
    path: assets.bigPicture,
    ...imageSizingContain(assets.bigPicture, 5.18, 2.04, 4.02, 2.9),
  });
  addPanel(slide, 9.46, 1.98, 3.12, 3.86, "Control plane внутри кластера", {
    border: COLORS.blue,
    fill: COLORS.blueSoft,
  });
  addBulletList(
    slide,
    [
      "API Server: точка входа",
      "Scheduler: выбирает node",
      "Controller Manager: следит за desired state",
      "etcd: хранит состояние кластера",
    ],
    { x: 9.68, y: 2.36, w: 2.66, h: 2.12 },
    { fontSize: 13 }
  );
  finalizeSlide(slide, pptx, "Что такое cluster");
}

function addNodeSlide(pptx, assets) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.teal);
  addHeader(slide, "Что такое нода", "Нода это место, где Kubernetes встречается с реальной машиной", "Здесь полезно переключить фокус с абстракции кластера на конкретный хост и его обязанности.", COLORS.teal);
  slide.addImage({
    path: assets.node,
    ...imageSizingContain(assets.node, 0.82, 2.0, 5.38, 3.74),
  });
  addPanel(slide, 6.52, 2.0, 6.04, 1.52, "Что обязательно есть на worker node", {
    border: COLORS.teal,
    fill: COLORS.tealSoft,
  });
  addBulletList(
    slide,
    [
      "операционная система с сетевым стеком и изоляцией процессов",
      "kubelet, который получает задания от control plane",
      "container runtime, который реально запускает контейнеры",
      "сетевые компоненты, чтобы Pod мог общаться внутри кластера",
    ],
    { x: 6.76, y: 2.36, w: 5.54, h: 0.92 },
    { fontSize: 13.2, minFontSize: 12.2, paraSpaceAfterPt: 3 }
  );
  addPanel(slide, 6.52, 3.78, 6.04, 1.96, "Как объяснить разработчику простыми словами", {
    border: COLORS.line,
  });
  addParagraph(
    slide,
    "Node это “рабочая лошадка” кластера. На ней живут Pods, туда scheduler отправляет workload, а kubelet следит, чтобы эти Pods действительно были подняты и оставались в нужном состоянии.",
    { x: 6.76, y: 4.16, w: 5.56, h: 0.76 },
    { fontSize: 13.4 }
  );
  addTag(slide, 6.76, 5.1, 1.66, "Не путать", { fill: COLORS.amberSoft, color: COLORS.amber });
  addParagraph(
    slide,
    "Node не равна Pod и не равна cluster. Это только один из узлов, на которых работает часть общей нагрузки.",
    { x: 8.56, y: 5.12, w: 3.76, h: 0.26 },
    { fontSize: 12.2, color: COLORS.muted }
  );
  finalizeSlide(slide, pptx, "Что такое нода");
}

function addControlLoopSlide(pptx, assets) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.violet);
  addHeader(slide, "Как система думает", "Desired state и reconciliation loop", "Это центральная идея Kubernetes. Если она понятна, многие другие объекты автоматически становятся логичнее.", COLORS.violet);
  slide.addImage({
    path: assets.controlLoop,
    ...imageSizingContain(assets.controlLoop, 0.8, 2.02, 7.16, 2.58),
  });
  addPanel(slide, 8.26, 2.0, 4.32, 2.6, "Что проговорить голосом", {
    border: COLORS.violet,
    fill: COLORS.violetSoft,
  });
  addBulletList(
    slide,
    [
      "Kubernetes не выполняет deploy как одноразовый скрипт",
      "система постоянно сверяет “что должно быть” и “что есть сейчас”",
      "если Pod умер или node пропала, платформа пытается восстановиться",
      "именно поэтому важен declarative подход, а не ручные команды на серверах",
    ],
    { x: 8.5, y: 2.38, w: 3.82, h: 1.86 },
    { fontSize: 13.1 }
  );
  addPanel(slide, 0.8, 5.02, 11.78, 0.94, "Одна фраза для запоминания", {
    border: COLORS.line,
    fill: COLORS.panel,
  });
  addParagraph(
    slide,
    "Ты описываешь intent, Kubernetes непрерывно пытается сделать реальность похожей на этот intent.",
    { x: 1.04, y: 5.36, w: 11.3, h: 0.2 },
    { fontSize: 14, align: "center" }
  );
  finalizeSlide(slide, pptx, "Desired state");
}

function addDemoSlide(pptx) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.amber);
  addHeader(slide, "Живое демо", "Что показывать руками", "Демо должно связывать термины со screen output. Лучше показать мало, но с четкими комментариями по каждому шагу.", COLORS.amber);
  addPanel(slide, 0.74, 1.98, 5.42, 3.96, "Сценарий демо", {
    border: COLORS.amber,
    fill: COLORS.amberSoft,
  });
  addBulletList(
    slide,
    [
      "проверить текущий контекст и показать, что мы работаем с кластером",
      "посмотреть список нод и роли: `kubectl get nodes -o wide`",
      "посмотреть системные Pods: `kubectl get pods -A`",
      "разобрать одну ноду через `kubectl describe node <name>`",
      "обратить внимание на capacity, allocatable, conditions и events",
    ],
    { x: 0.98, y: 2.36, w: 4.92, h: 2.88 },
    { fontSize: 13.6 }
  );
  addPanel(slide, 6.46, 1.98, 6.1, 3.96, "Реплики команд", {
    border: COLORS.line,
  });
  slide.addText(
    [
      { text: "$ kubectl config current-context", options: { breakLine: true } },
      { text: "$ kubectl get nodes -o wide", options: { breakLine: true } },
      { text: "$ kubectl get pods -A", options: { breakLine: true } },
      { text: "$ kubectl describe node worker-1", options: { breakLine: true } },
      { text: "$ kubectl get events -A --sort-by=.lastTimestamp", options: {} },
    ],
    {
      x: 6.74,
      y: 2.42,
      w: 5.54,
      h: 2.1,
      fontFace: MONO,
      fontSize: 14,
      color: COLORS.ink,
      margin: 0,
      breakLine: false,
      valign: "top",
    }
  );
  addPanel(slide, 6.46, 5.16, 6.1, 0.78, "На что смотреть вместе с аудиторией", {
    border: COLORS.line,
    fill: COLORS.panel,
  });
  addParagraph(
    slide,
    "Не просто листай output. Каждый экран должен отвечать на вопрос: где виден cluster, где видна node, кто о чем отчитывается.",
    { x: 6.72, y: 5.52, w: 5.56, h: 0.16 },
    { fontSize: 12.6, color: COLORS.muted }
  );
  finalizeSlide(slide, pptx, "Живое демо");
}

function addHomeworkSlide(pptx) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.blue);
  addHeader(slide, "Домашнее задание", "Как закрепить материал после занятия", "Домашка должна быть выполнимой за 30-40 минут и готовить почву к теме Pod / Deployment / Service.", COLORS.blue);
  addCard(
    slide,
    0.8,
    1.98,
    3.82,
    2.34,
    "Практика",
    "Поднять локальный кластер через kind или minikube и сохранить скриншот вывода `kubectl get nodes -o wide`.",
    COLORS.blue,
    COLORS.blueSoft
  );
  addCard(
    slide,
    4.76,
    1.98,
    3.82,
    2.34,
    "Понимание",
    "Коротко письменно ответить: чем cluster отличается от node и почему разработчику полезно знать оба термина.",
    COLORS.teal,
    COLORS.tealSoft
  );
  addCard(
    slide,
    8.72,
    1.98,
    3.82,
    2.34,
    "Подготовка к неделе 2",
    "Прочитать базовую заметку про Pod и подготовить вопрос: почему Pod не равен контейнеру один-к-одному.",
    COLORS.violet,
    COLORS.violetSoft
  );
  addPanel(slide, 0.8, 4.66, 11.74, 1.28, "Критерий хорошего результата", {
    border: COLORS.line,
  });
  addParagraph(
    slide,
    "Если участник может на словах объяснить “cluster = платформа целиком, node = отдельная машина внутри нее” и показать хотя бы один локальный кластер, вводная неделя сработала.",
    { x: 1.04, y: 5.04, w: 11.24, h: 0.38 },
    { fontSize: 14 }
  );
  finalizeSlide(slide, pptx, "Домашнее задание");
}

function addWrapSlide(pptx) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.teal);
  addHeader(slide, "Итог", "Пять мыслей, которые должны остаться после занятия", "Закрываем первую неделю так, чтобы у аудитории осталась опорная карта, а не набор терминов.", COLORS.teal);
  addPanel(slide, 0.8, 2.0, 12.0, 3.84, "Takeaways", {
    border: COLORS.line,
  });
  const takeaways = [
    "Kubernetes нужен для управления распределенной операционной сложностью, а не только для запуска контейнеров.",
    "Главная идея платформы: desired state + постоянный reconciliation loop.",
    "Cluster это единая система управления и исполнения, а node это одна конкретная машина внутри нее.",
    "Control plane принимает решения, worker nodes исполняют workload.",
    "Следующая неделя логично продолжает эту модель через Pod, Deployment и Service.",
  ];
  takeaways.forEach((item, index) => {
    const y = 2.34 + index * 0.6;
    slide.addShape("roundRect", {
      x: 1.02,
      y,
      w: 0.34,
      h: 0.34,
      rectRadius: 0.07,
      line: { color: COLORS.teal, pt: 1 },
      fill: { color: COLORS.tealSoft },
    });
    slide.addText(String(index + 1), {
      x: 1.1,
      y: y + 0.09,
      w: 0.18,
      h: 0.12,
      fontFace: FONT,
      fontSize: 10,
      bold: true,
      color: COLORS.teal,
      margin: 0,
      align: "center",
    });
    addParagraph(slide, item, { x: 1.58, y: y + 0.03, w: 10.9, h: 0.22 }, {
      fontSize: 13.3,
    });
  });
  addTag(slide, 0.82, 6.16, 2.18, "Next week: Pod / Deployment / Service", {
    fill: COLORS.blueSoft,
    color: COLORS.blue,
  });
  finalizeSlide(slide, pptx, "Итог");
}

async function main() {
  ensureOutDir();
  const assets = await ensureDiagramAssets();
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "CashFlow";
  pptx.subject = "Kubernetes Week 1";
  pptx.title = "Неделя 1 — Зачем Kubernetes? Расширенная сессия";
  pptx.lang = "ru-RU";
  pptx.theme = {
    headFontFace: FONT,
    bodyFontFace: FONT,
    lang: "ru-RU",
  };

  addTitleSlide(pptx);
  addGoalsSlide(pptx);
  addProgramSlide(pptx);
  addWhySlide(pptx, assets);
  addBigPictureSlide(pptx, assets);
  addTopicsSlide(pptx);
  addClusterSlide(pptx, assets);
  addNodeSlide(pptx, assets);
  addControlLoopSlide(pptx, assets);
  addDemoSlide(pptx);
  addHomeworkSlide(pptx);
  addWrapSlide(pptx);

  await pptx.writeFile({ fileName: OUT_FILE });
  console.log(`Deck written to ${OUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
