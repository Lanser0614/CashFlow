const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");
const { autoFontSize, calcTextBox } = require("./pptxgenjs_helpers/text");
const { imageSizingContain } = require("./pptxgenjs_helpers/image");
const { svgToDataUri } = require("./pptxgenjs_helpers/svg");
const {
  warnIfSlideHasOverlaps,
  warnIfSlideElementsOutOfBounds,
} = require("./pptxgenjs_helpers/layout");

const OUT_DIR = path.join(__dirname, "build");
const OUT_FILE = path.join(
  OUT_DIR,
  "kubernetes-knowledge-sharing-phase-1.pptx"
);

const COLORS = {
  ink: "0F172A",
  text: "1E293B",
  muted: "475569",
  soft: "64748B",
  surface: "F8FAFC",
  panel: "FFFFFF",
  line: "D7E2F0",
  accent: "2563EB",
  accentDark: "1D4ED8",
  accentSoft: "DBEAFE",
  mint: "D1FAE5",
  mintBorder: "6EE7B7",
  amber: "FEF3C7",
  amberBorder: "F59E0B",
  rose: "FFE4E6",
  roseBorder: "FB7185",
  violet: "EDE9FE",
  violetBorder: "8B5CF6",
};

const FONT_FACE = "Arial";
const MONO_FACE = "Menlo";
const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

const weeks = [
  {
    number: 1,
    title: "Зачем Kubernetes?",
    subtitle: "Big picture",
    accent: COLORS.accent,
    accentSoft: COLORS.accentSoft,
    border: "93C5FD",
    goals: [
      "Понять, какую операционную боль Kubernetes закрывает у команды.",
      "Разобрать базовую модель: control plane, worker nodes, desired state.",
      "Связать кластерные абстракции с привычной разработкой и деплоем.",
    ],
    program: [
      "Почему просто Docker уже недостаточен на масштабе нескольких сервисов.",
      "Как Kubernetes управляет размещением, самоисцелением и rollout'ами.",
      "Что такое кластер и нода, кто за что отвечает внутри платформы.",
    ],
    focusTitle: "Ключевые темы",
    focusItems: [
      "desired state и reconciliation loop",
      "control plane vs worker nodes",
      "scheduler, kubelet, kube-proxy",
    ],
    practiceTitle: "Живое демо",
    practiceItems: [
      "Поднять локальный кластер и посмотреть `kubectl get nodes`.",
      "Разобрать namespace, pod list и события через `kubectl describe`.",
    ],
    homework: [
      "Установить `kind` или `minikube` на ноутбук.",
      "Подготовить объяснение: чем кластер отличается от одной VM с Docker.",
    ],
  },
  {
    number: 2,
    title: "Pod, Deployment, Service",
    subtitle: "Базовые workload-объекты",
    accent: "0F766E",
    accentSoft: "CCFBF1",
    border: "5EEAD4",
    goals: [
      "Понять жизненный цикл Pod и почему с Pod напрямую почти не работают.",
      "Разобрать Deployment как декларативный способ управлять репликами.",
      "Связать Service с сетевой стабильностью и service discovery.",
    ],
    program: [
      "Pod как минимальная deployable unit.",
      "Deployment, ReplicaSet, rollout и rollback.",
      "ClusterIP, NodePort и headless service на уровне решения задач.",
    ],
    focusTitle: "Что важно запомнить",
    focusItems: [
      "Pod эфемерен, Deployment описывает желаемое состояние",
      "Service дает стабильный DNS и виртуальный IP",
      "labels и selectors склеивают все объекты между собой",
    ],
    practiceTitle: "Практика",
    practiceItems: [
      "Задеплоить `nginx` через Deployment.",
      "Открыть приложение через Service и масштабировать реплики.",
    ],
    homework: [
      "Написать YAML для Pod, Deployment и Service.",
      "Потренировать rollout restart и rollback на локальном стенде.",
    ],
  },
  {
    number: 3,
    title: "ConfigMap, Secret, переменные окружения",
    subtitle: "Конфигурация приложения",
    accent: "7C3AED",
    accentSoft: COLORS.violet,
    border: "C4B5FD",
    goals: [
      "Отделить код приложения от конфигурации окружения.",
      "Понять различия между ConfigMap и Secret.",
      "Выбрать подходящее подключение конфигов в runtime.",
    ],
    program: [
      "ConfigMap для обычной конфигурации и feature flags.",
      "Secret для чувствительных данных и ограничений его безопасности.",
      "Env vars, volume mounts и `envFrom` как основные способы передачи.",
    ],
    focusTitle: "Способы монтирования",
    focusItems: [
      "одна переменная через `valueFrom`",
      "массовый импорт через `envFrom`",
      "файлы в volume для конфигов и сертификатов",
    ],
    practiceTitle: "Практика",
    practiceItems: [
      "Подключить `.env`-подобную конфигурацию к демо-приложению.",
      "Смонтировать Secret как файл и проверить его в контейнере.",
    ],
    homework: [
      "Вынести настройки тестового сервиса в ConfigMap.",
      "Подготовить Secret и объяснить, где он все еще уязвим.",
    ],
  },
  {
    number: 4,
    title: "Ingress и роутинг",
    subtitle: "Доступ к приложениям",
    accent: "EA580C",
    accentSoft: "FFEDD5",
    border: "FDBA74",
    goals: [
      "Понять место Ingress Controller между сервисами и внешним трафиком.",
      "Разобрать routing по host и path.",
      "Собрать минимальную картину по TLS и сертификатам.",
    ],
    program: [
      "Ingress как API-объект и Controller как реальный исполнитель.",
      "Host-based и path-based routing на боевых сценариях.",
      "TLS termination, cert-manager и когда нужен отдельный gateway.",
    ],
    focusTitle: "Итоги фазы 1",
    focusItems: [
      "умеем задеплоить сервис, прокинуть конфиг и открыть его наружу",
      "понимаем базовый operational flow: build -> deploy -> expose",
      "готовы перейти к трекам по стекам команды",
    ],
    practiceTitle: "Практика",
    practiceItems: [
      "Настроить ingress правило для двух путей одного домена.",
      "Подключить self-signed TLS и проверить заголовки/маршрутизацию.",
    ],
    homework: [
      "Собрать ingress для своего демо-сервиса.",
      "Подготовить вопросы по сетевой модели перед фазой 2.",
    ],
  },
];

function ensureOutDir() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function addBackdrop(slide, accent) {
  slide.background = { color: COLORS.surface };
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: 0.18,
    line: { color: accent, transparency: 100 },
    fill: { color: accent },
  });
}

function addHeader(slide, eyebrow, title, subtitle, accent) {
  slide.addText(eyebrow.toUpperCase(), {
    x: 0.7,
    y: 0.48,
    w: 2.4,
    h: 0.24,
    fontFace: FONT_FACE,
    fontSize: 10,
    bold: true,
    color: accent,
    charSpace: 1.2,
    margin: 0,
  });

  slide.addText(title, autoFontSize(title, FONT_FACE, {
    x: 0.7,
    y: 0.76,
    w: 7.6,
    h: 0.6,
    minFontSize: 22,
    maxFontSize: 28,
    bold: true,
    color: COLORS.ink,
    margin: 0,
  }));

  if (subtitle) {
    slide.addText(subtitle, {
      x: 0.7,
      y: 1.42,
      w: 7.2,
      h: 0.35,
      fontFace: FONT_FACE,
      fontSize: 11,
      color: COLORS.muted,
      margin: 0,
    });
  }
}

function addFooter(slide, label) {
  slide.addText(label, {
    x: 0.72,
    y: 7.06,
    w: 2.8,
    h: 0.18,
    fontFace: FONT_FACE,
    fontSize: 9,
    color: COLORS.soft,
    margin: 0,
  });
}

function addPanel(slide, opts) {
  slide.addShape("roundRect", {
    x: opts.x,
    y: opts.y,
    w: opts.w,
    h: opts.h,
    rectRadius: 0.08,
    line: { color: opts.border || COLORS.line, pt: 1.2 },
    fill: { color: opts.fill || COLORS.panel },
  });
  if (opts.title) {
    slide.addText(opts.title, {
      x: opts.x + 0.22,
      y: opts.y + 0.16,
      w: opts.w - 0.44,
      h: 0.16,
      fontFace: FONT_FACE,
      fontSize: 12,
      bold: true,
      color: COLORS.ink,
      margin: 0,
    });
  }
}

function buildBulletRuns(items) {
  return items.map((item, index) => ({
    text: item,
    options: {
      bullet: { indent: 15 },
      breakLine: index !== items.length - 1,
      paraSpaceAfterPt: 4,
    },
  }));
}

function addBulletList(slide, items, box, color = COLORS.text, fontSize = 15) {
  const runs = buildBulletRuns(items);
  const fitted = autoFontSize(runs, FONT_FACE, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: box.h,
    fontSize,
    minFontSize: Math.max(11, fontSize - 3),
    maxFontSize: fontSize,
    color,
    margin: 0,
    valign: "top",
    mode: "shrink",
  });
  slide.addText(runs, fitted);
}

function addWeekPill(slide, x, y, week, w) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h: 0.74,
    rectRadius: 0.08,
    line: { color: week.border, pt: 1.1 },
    fill: { color: week.accentSoft },
  });
  slide.addText(
    [
      {
        text: `Неделя ${week.number}`,
        options: {
          breakLine: true,
          bold: true,
          color: week.accent,
          fontSize: 9,
        },
      },
      {
        text: week.title,
        options: {
          bold: true,
          color: COLORS.ink,
        },
      },
    ],
    autoFontSize(`Неделя ${week.number}\n${week.title}`, FONT_FACE, {
      x: x + 0.18,
      y: y + 0.1,
      w: w - 0.36,
      h: 0.46,
      minFontSize: 11,
      maxFontSize: 13,
      color: COLORS.ink,
      margin: 0,
      valign: "mid",
    })
  );
}

function addParagraph(slide, text, box, fontSize = 14, color = COLORS.text) {
  const measured = calcTextBox(fontSize, {
    text,
    w: box.w,
    fontFace: FONT_FACE,
    margin: 0,
  });
  slide.addText(text, {
    x: box.x,
    y: box.y,
    w: box.w,
    h: Math.min(box.h, measured.h + 0.08),
    fontFace: FONT_FACE,
    fontSize,
    color,
    margin: 0,
    valign: "top",
  });
}

function drawTable(slide, opts) {
  const headerH = opts.headerH || 0.56;
  const rowH = opts.rowH || 0.58;
  let currentY = opts.y;

  opts.columns.forEach((column, index) => {
    slide.addShape("rect", {
      x: column.x,
      y: currentY,
      w: column.w,
      h: headerH,
      line: { color: opts.border || COLORS.line, pt: 1 },
      fill: { color: opts.headerFill || "EFF6FF" },
    });
    slide.addText(column.label, {
      x: column.x + 0.14,
      y: currentY + 0.16,
      w: column.w - 0.28,
      h: 0.2,
      fontFace: FONT_FACE,
      fontSize: 11,
      bold: true,
      color: COLORS.ink,
      margin: 0,
      valign: "mid",
      align: index === 0 ? "center" : "left",
    });
  });

  currentY += headerH;
  opts.rows.forEach((row, rowIndex) => {
    opts.columns.forEach((column, columnIndex) => {
      slide.addShape("rect", {
        x: column.x,
        y: currentY,
        w: column.w,
        h: rowH,
        line: { color: opts.border || COLORS.line, pt: 1 },
        fill: {
          color: rowIndex % 2 === 0 ? "FFFFFF" : "F8FAFC",
        },
      });
      slide.addText(String(row[columnIndex]), {
        x: column.x + 0.14,
        y: currentY + 0.12,
        w: column.w - 0.28,
        h: rowH - 0.18,
        fontFace: FONT_FACE,
        fontSize: 12,
        color: COLORS.text,
        margin: 0,
        valign: "mid",
        align: columnIndex === 0 ? "center" : "left",
      });
    });
    currentY += rowH;
  });
}

function makeClusterSvg() {
  return svgToDataUri(`
    <svg width="520" height="300" viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="500" height="280" rx="26" fill="#EFF6FF" stroke="#93C5FD" stroke-width="3"/>
      <rect x="36" y="40" width="145" height="96" rx="18" fill="#DBEAFE" stroke="#60A5FA" stroke-width="2"/>
      <text x="108.5" y="72" font-family="Arial" font-size="20" font-weight="700" text-anchor="middle" fill="#1D4ED8">Control Plane</text>
      <text x="108.5" y="101" font-family="Arial" font-size="13" text-anchor="middle" fill="#334155">API Server</text>
      <text x="108.5" y="121" font-family="Arial" font-size="13" text-anchor="middle" fill="#334155">Scheduler</text>
      <rect x="220" y="44" width="120" height="220" rx="18" fill="#FFFFFF" stroke="#A7F3D0" stroke-width="2"/>
      <rect x="360" y="44" width="120" height="220" rx="18" fill="#FFFFFF" stroke="#FCD34D" stroke-width="2"/>
      <text x="280" y="76" font-family="Arial" font-size="18" font-weight="700" text-anchor="middle" fill="#0F766E">Node A</text>
      <text x="420" y="76" font-family="Arial" font-size="18" font-weight="700" text-anchor="middle" fill="#B45309">Node B</text>
      <rect x="242" y="104" width="76" height="36" rx="12" fill="#CCFBF1" />
      <rect x="242" y="150" width="76" height="36" rx="12" fill="#CCFBF1" />
      <rect x="382" y="104" width="76" height="36" rx="12" fill="#FEF3C7" />
      <rect x="382" y="150" width="76" height="36" rx="12" fill="#FEF3C7" />
      <text x="280" y="127" font-family="Arial" font-size="14" text-anchor="middle" fill="#115E59">Pod</text>
      <text x="280" y="173" font-family="Arial" font-size="14" text-anchor="middle" fill="#115E59">Pod</text>
      <text x="420" y="127" font-family="Arial" font-size="14" text-anchor="middle" fill="#92400E">Pod</text>
      <text x="420" y="173" font-family="Arial" font-size="14" text-anchor="middle" fill="#92400E">Pod</text>
      <path d="M181 88 C205 88, 205 88, 220 88" stroke="#60A5FA" stroke-width="3" fill="none"/>
      <path d="M181 88 C240 88, 310 88, 360 88" stroke="#60A5FA" stroke-width="3" fill="none"/>
    </svg>
  `);
}

function makeServiceSvg() {
  return svgToDataUri(`
    <svg width="520" height="270" viewBox="0 0 520 270" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="20" width="496" height="230" rx="26" fill="#FFF7ED" stroke="#FDBA74" stroke-width="3"/>
      <rect x="38" y="102" width="110" height="62" rx="18" fill="#EA580C"/>
      <text x="93" y="130" font-family="Arial" font-size="18" font-weight="700" text-anchor="middle" fill="#FFFFFF">Ingress</text>
      <text x="93" y="150" font-family="Arial" font-size="12" text-anchor="middle" fill="#FFFFFF">host/path rules</text>
      <rect x="192" y="101" width="120" height="64" rx="18" fill="#FFEDD5" stroke="#FB923C" stroke-width="2"/>
      <text x="252" y="128" font-family="Arial" font-size="18" font-weight="700" text-anchor="middle" fill="#9A3412">Service</text>
      <text x="252" y="149" font-family="Arial" font-size="12" text-anchor="middle" fill="#7C2D12">stable VIP + DNS</text>
      <rect x="350" y="56" width="118" height="48" rx="16" fill="#FFFFFF" stroke="#FED7AA" stroke-width="2"/>
      <rect x="350" y="112" width="118" height="48" rx="16" fill="#FFFFFF" stroke="#FED7AA" stroke-width="2"/>
      <rect x="350" y="168" width="118" height="48" rx="16" fill="#FFFFFF" stroke="#FED7AA" stroke-width="2"/>
      <text x="409" y="85" font-family="Arial" font-size="15" text-anchor="middle" fill="#7C2D12">Pod A</text>
      <text x="409" y="141" font-family="Arial" font-size="15" text-anchor="middle" fill="#7C2D12">Pod B</text>
      <text x="409" y="197" font-family="Arial" font-size="15" text-anchor="middle" fill="#7C2D12">Pod C</text>
      <path d="M148 133 L192 133" stroke="#F97316" stroke-width="4"/>
      <path d="M312 133 L350 80" stroke="#F97316" stroke-width="3"/>
      <path d="M312 133 L350 136" stroke="#F97316" stroke-width="3"/>
      <path d="M312 133 L350 192" stroke="#F97316" stroke-width="3"/>
    </svg>
  `);
}

function addTitleSlide(pptx) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.accent);

  slide.addShape("roundRect", {
    x: 0.68,
    y: 0.62,
    w: 1.92,
    h: 0.34,
    rectRadius: 0.06,
    line: { color: COLORS.accentSoft, pt: 1 },
    fill: { color: COLORS.accentSoft },
  });
  slide.addText("Internal Knowledge Sharing", {
    x: 0.82,
    y: 0.72,
    w: 1.62,
    h: 0.14,
    fontFace: FONT_FACE,
    fontSize: 10,
    bold: true,
    color: COLORS.accentDark,
    margin: 0,
    align: "center",
  });

  const title = "Kubernetes Knowledge Sharing";
  slide.addText(title, autoFontSize(title, FONT_FACE, {
    x: 0.74,
    y: 1.14,
    w: 5.55,
    h: 0.72,
    minFontSize: 24,
    maxFontSize: 29,
    bold: true,
    color: COLORS.ink,
    margin: 0,
  }));
  slide.addText("Фаза 1: Основы", {
    x: 0.74,
    y: 1.94,
    w: 3.9,
    h: 0.42,
    fontFace: FONT_FACE,
    fontSize: 22,
    bold: true,
    color: COLORS.accentDark,
    margin: 0,
  });
  slide.addText(
    "Четыре недели, чтобы собрать правильную mental model: от big picture до ingress, routing и готовности к стековым трекам фазы 2.",
    {
      x: 0.74,
      y: 2.5,
      w: 5.65,
      h: 0.9,
      fontFace: FONT_FACE,
      fontSize: 15,
      color: COLORS.text,
      margin: 0,
      valign: "top",
    }
  );

  addPanel(slide, {
    x: 0.72,
    y: 3.75,
    w: 5.8,
    h: 2.06,
    fill: COLORS.panel,
    border: COLORS.line,
    title: "Что будет в фазе",
  });
  addBulletList(
    slide,
    [
      "Почему Kubernetes вообще нужен команде, а не только платформенной группе.",
      "Базовые объекты для деплоя, сетевой доступности и конфигурации.",
      "Практика на локальном кластере и переход к специализации по стеку.",
    ],
    { x: 0.96, y: 4.17, w: 5.24, h: 1.26 },
    COLORS.text,
    15
  );

  addPanel(slide, {
    x: 6.83,
    y: 0.96,
    w: 5.74,
    h: 5.88,
    fill: "FDFEFF",
    border: COLORS.line,
    title: "Roadmap на 4 недели",
  });
  weeks.forEach((week, index) => {
    addWeekPill(slide, 7.08, 1.38 + index * 1.03, week, 5.22);
  });

  slide.addText("Выход фазы 1", {
    x: 7.08,
    y: 5.92,
    w: 1.8,
    h: 0.18,
    fontFace: FONT_FACE,
    fontSize: 11,
    bold: true,
    color: COLORS.ink,
    margin: 0,
  });
  slide.addText(
    "Участник понимает ключевые объекты Kubernetes, умеет читать YAML, раскладывать приложение на Pod/Deployment/Service и объяснять, как конфиг, ingress и TLS собираются в рабочий deployment flow.",
    {
      x: 7.08,
      y: 6.16,
      w: 5.02,
      h: 0.5,
      fontFace: FONT_FACE,
      fontSize: 11,
      color: COLORS.muted,
      margin: 0,
      valign: "top",
    }
  );

  addFooter(slide, "Kubernetes Knowledge Sharing");
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function addOverviewSlide(pptx) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.accent);
  addHeader(
    slide,
    "Обзор",
    "Обзор фазы 1",
    "Курс идет от архитектурной картины к реальному publish-потоку приложения.",
    COLORS.accent
  );

  drawTable(slide, {
    x: 0.72,
    y: 1.96,
    border: COLORS.line,
    columns: [
      { x: 0.72, w: 1.18, label: "Неделя" },
      { x: 1.9, w: 5.3, label: "Тема" },
    ],
    rows: weeks.map((week) => [
      String(week.number),
      `${week.title}${week.subtitle ? " • " + week.subtitle : ""}`,
    ]),
    headerH: 0.58,
    rowH: 0.62,
  });

  addPanel(slide, {
    x: 7.54,
    y: 1.96,
    w: 5.08,
    h: 3.42,
    fill: COLORS.panel,
    border: COLORS.line,
    title: "Логика прогрессии",
  });
  const timeline = [
    "1. Сначала создаем общую карту: cluster, node, control plane, desired state.",
    "2. Потом спускаемся к ежедневной работе: Pod, Deployment, Service.",
    "3. Дальше учимся отделять конфиг и секреты от образа приложения.",
    "4. В конце открываем сервис наружу через Ingress и TLS.",
  ];
  slide.addText(
    timeline.map((item, index) => ({
      text: item,
      options: { breakLine: index !== timeline.length - 1, paraSpaceAfterPt: 8 },
    })),
    autoFontSize(timeline.join("\n"), FONT_FACE, {
      x: 7.8,
      y: 2.42,
      w: 4.52,
      h: 2.08,
      fontSize: 14,
      minFontSize: 12,
      maxFontSize: 14,
      color: COLORS.text,
      margin: 0,
      valign: "top",
      mode: "shrink",
    })
  );

  addPanel(slide, {
    x: 0.72,
    y: 5.62,
    w: 11.9,
    h: 1.02,
    fill: "EFF6FF",
    border: "BFDBFE",
    title: "Формат",
  });
  addParagraph(
    slide,
    "Каждая неделя состоит из короткой теории, живого разбора через `kubectl`, практики на локальном кластере и домашнего задания, которое готовит к следующей теме.",
    { x: 0.96, y: 6.08, w: 11.42, h: 0.32 },
    13
  );

  addFooter(slide, "Обзор фазы");
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function addWeekSlide(pptx, week) {
  const slide = pptx.addSlide();
  addBackdrop(slide, week.accent);
  addHeader(
    slide,
    `Неделя ${week.number}`,
    `${week.title}`,
    week.subtitle,
    week.accent
  );

  addPanel(slide, {
    x: 0.72,
    y: 1.98,
    w: 3.72,
    h: 2.1,
    fill: COLORS.panel,
    border: week.border,
    title: "Цели",
  });
  addBulletList(slide, week.goals, {
    x: 0.96,
    y: 2.46,
    w: 3.22,
    h: 1.28,
  });

  addPanel(slide, {
    x: 0.72,
    y: 4.28,
    w: 3.72,
    h: 1.9,
    fill: COLORS.panel,
    border: COLORS.line,
    title: "Программа",
  });
  addBulletList(slide, week.program, {
    x: 0.96,
    y: 4.76,
    w: 3.22,
    h: 1.08,
  }, COLORS.text, 14);

  addPanel(slide, {
    x: 4.72,
    y: 1.98,
    w: 4.14,
    h: 2.6,
    fill: "FDFEFF",
    border: week.border,
    title: week.focusTitle,
  });
  addBulletList(slide, week.focusItems, {
    x: 4.98,
    y: 2.46,
    w: 3.62,
    h: 1.56,
  }, COLORS.text, 15);

  addPanel(slide, {
    x: 4.72,
    y: 4.88,
    w: 4.14,
    h: 1.3,
    fill: week.accentSoft,
    border: week.border,
    title: week.practiceTitle,
  });
  addBulletList(slide, week.practiceItems, {
    x: 4.98,
    y: 5.34,
    w: 3.58,
    h: 0.5,
  }, COLORS.text, 13);

  addPanel(slide, {
    x: 9.1,
    y: 1.98,
    w: 3.52,
    h: 4.2,
    fill: COLORS.panel,
    border: COLORS.line,
    title: "Домашнее задание",
  });
  addBulletList(slide, week.homework, {
    x: 9.36,
    y: 2.46,
    w: 3.0,
    h: 1.1,
  }, COLORS.text, 15);

  if (week.number === 1) {
    slide.addText("Что такое кластер и нода", {
      x: 9.36,
      y: 3.9,
      w: 2.4,
      h: 0.18,
      fontFace: FONT_FACE,
      fontSize: 11,
      bold: true,
      color: COLORS.ink,
      margin: 0,
    });
    slide.addImage({
      data: makeClusterSvg(),
      ...imageSizingContain(makeClusterSvg(), 9.26, 4.08, 3.12, 1.7),
    });
  }

  if (week.number === 2) {
    slide.addText("Схема объектов", {
      x: 9.36,
      y: 3.9,
      w: 2.4,
      h: 0.18,
      fontFace: FONT_FACE,
      fontSize: 11,
      bold: true,
      color: COLORS.ink,
      margin: 0,
    });
    slide.addText("Pod <- Deployment -> Service", {
      x: 9.36,
      y: 4.22,
      w: 2.76,
      h: 0.28,
      fontFace: MONO_FACE,
      fontSize: 14,
      color: week.accent,
      margin: 0,
      bold: true,
      align: "center",
    });
    slide.addText(
      "labels/selectors связывают Service с репликами Pod, а Deployment следит за количеством и rollout'ом",
      {
        x: 9.28,
        y: 4.74,
        w: 3.1,
        h: 1.1,
        fontFace: FONT_FACE,
        fontSize: 12,
        color: COLORS.muted,
        margin: 0,
        valign: "top",
        align: "center",
      }
    );
  }

  if (week.number === 3) {
    slide.addText("Правило недели", {
      x: 9.36,
      y: 3.9,
      w: 2.2,
      h: 0.18,
      fontFace: FONT_FACE,
      fontSize: 11,
      bold: true,
      color: COLORS.ink,
      margin: 0,
    });
    slide.addText(
      "Образ контейнера остается неизменным, а среда исполнения меняется через ConfigMap и Secret.",
      {
        x: 9.28,
        y: 4.24,
        w: 3.12,
        h: 1.26,
        fontFace: FONT_FACE,
        fontSize: 13,
        color: COLORS.text,
        margin: 0,
        valign: "mid",
      }
    );
  }

  if (week.number === 4) {
    slide.addText("Ingress flow", {
      x: 9.36,
      y: 3.9,
      w: 2.2,
      h: 0.18,
      fontFace: FONT_FACE,
      fontSize: 11,
      bold: true,
      color: COLORS.ink,
      margin: 0,
    });
    slide.addImage({
      data: makeServiceSvg(),
      ...imageSizingContain(makeServiceSvg(), 9.22, 4.08, 3.2, 1.76),
    });
  }

  addFooter(slide, `Неделя ${week.number}`);
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

function addPrepSlide(pptx) {
  const slide = pptx.addSlide();
  addBackdrop(slide, COLORS.accentDark);
  addHeader(
    slide,
    "Следующий шаг",
    "Подготовка к фазе 2",
    "После общей базы команда расходится по трекам, но говорит на одном языке Kubernetes.",
    COLORS.accentDark
  );

  drawTable(slide, {
    x: 0.72,
    y: 1.94,
    border: COLORS.line,
    columns: [
      { x: 0.72, w: 2.24, label: "Трек" },
      { x: 2.96, w: 4.94, label: "Тема недели 5" },
    ],
    rows: [
      ["PHP / Laravel", "Dockerfile, Queue Workers, Kafka-консьюмеры"],
      [
        "Java / Spring Boot",
        "JVM в контейнере, liveness/readiness probes",
      ],
      ["React", "Multi-stage build, env во время сборки"],
    ],
    headerH: 0.58,
    rowH: 0.76,
  });

  addPanel(slide, {
    x: 8.2,
    y: 1.94,
    w: 4.42,
    h: 3.05,
    fill: COLORS.panel,
    border: COLORS.line,
    title: "Что должно остаться после фазы 1",
  });
  addBulletList(
    slide,
    [
      "Уверенно читать базовые манифесты Kubernetes.",
      "Отличать runtime-конфиг от контейнерного образа.",
      "Понимать путь внешнего запроса до Pod.",
      "Иметь локальный кластер для безопасных экспериментов.",
    ],
    { x: 8.44, y: 2.44, w: 3.9, h: 1.92 },
    COLORS.text,
    14
  );

  addPanel(slide, {
    x: 0.72,
    y: 5.34,
    w: 11.9,
    h: 1.18,
    fill: "EFF6FF",
    border: "BFDBFE",
    title: "Материалы",
  });
  slide.addText(
    [
      {
        text: "Неделя 1 — Зачем Kubernetes?",
        options: {
          hyperlink: {
            url: "https://www.notion.so/1-Kubernetes-322f94e077a080598a0bf8ae54d9b4b6?pvs=21",
          },
          color: COLORS.accentDark,
          underline: { color: COLORS.accentDark },
          bold: true,
        },
      },
      {
        text: " — ссылка на базовый конспект и стартовую домашнюю подготовку.",
        options: {
          color: COLORS.text,
        },
      },
    ],
    autoFontSize(
      "Неделя 1 — Зачем Kubernetes? — ссылка на базовый конспект и стартовую домашнюю подготовку.",
      FONT_FACE,
      {
        x: 0.96,
        y: 5.84,
        w: 11.24,
        h: 0.24,
        fontSize: 14,
        minFontSize: 12,
        maxFontSize: 14,
        margin: 0,
        valign: "mid",
        mode: "shrink",
      }
    )
  );

  addFooter(slide, "Подготовка к фазе 2");
  warnIfSlideHasOverlaps(slide, pptx);
  warnIfSlideElementsOutOfBounds(slide, pptx);
}

async function main() {
  ensureOutDir();
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "OpenAI Codex";
  pptx.company = "CashFlow";
  pptx.subject = "Kubernetes Knowledge Sharing";
  pptx.title = "Kubernetes Knowledge Sharing — Фаза 1: Основы";
  pptx.lang = "ru-RU";
  pptx.theme = {
    headFontFace: FONT_FACE,
    bodyFontFace: FONT_FACE,
    lang: "ru-RU",
  };
  pptx.defineLayout({ name: "CODExWide", width: SLIDE_W, height: SLIDE_H });

  addTitleSlide(pptx);
  addOverviewSlide(pptx);
  weeks.forEach((week) => addWeekSlide(pptx, week));
  addPrepSlide(pptx);

  await pptx.writeFile({ fileName: OUT_FILE });
  console.log(`Deck written to ${OUT_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
