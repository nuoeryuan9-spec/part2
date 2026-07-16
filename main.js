const root = document.documentElement;
const world = document.querySelector("#world");
const stage = document.querySelector("[data-stage]");
const scrollyDemo = document.querySelector(".scrolly-demo");
const scenes = Array.from(document.querySelectorAll(".scene"));
const layers = Array.from(document.querySelectorAll("[data-depth]"));
const dots = Array.from(document.querySelectorAll(".wayfinder span"));
const ribbon = document.querySelector(".progress-ribbon span");
const openingCover = document.querySelector("[data-opening-cover]");
const openingTransition = document.querySelector("[data-opening-transition]");
const openingStory = document.querySelector("[data-opening-story]");
const enterButton = document.querySelector("[data-enter-button]");
const firstContent = document.querySelector("[data-first-content]");
const chapter2Intro = document.querySelector("[data-chapter2-intro]");
const chapter2Root = document.querySelector("#chapter2");
const chapter2Content = document.querySelector("[data-chapter2-content]");
const chapter2Return = document.querySelector("[data-chapter2-return]");
const chapter2Targets = Array.from(document.querySelectorAll("[data-chapter2-target]"));
const liStory = document.querySelector("[data-li-story]");
const liStoryWorld = document.querySelector(".li-story__world");
const liSteps = Array.from(document.querySelectorAll("[data-li-step]"));
const liP23Section = document.querySelector("[data-li-p23-section]");
const liFrames = Array.from(document.querySelectorAll("[data-li-frame]"));
const liCopy = Array.from(document.querySelectorAll("[data-li-copy]"));
const revealSections = Array.from(document.querySelectorAll("[data-reveal]"));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const cameraPath = [
  { t: 0, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, scale: 1 },
  { t: 0.22, x: -430, y: 28, z: 940, rx: 1, ry: 7, rz: -1.2, scale: 1.08 },
  { t: 0.47, x: 440, y: -34, z: 2050, rx: -1.5, ry: -8, rz: 1.6, scale: 1.04 },
  { t: 0.62, x: 440, y: -34, z: 2050, rx: -1.5, ry: -8, rz: 1.6, scale: 1.04 },
  { t: 0.72, x: -180, y: 44, z: 3230, rx: 2, ry: 6, rz: -1.4, scale: 1.08 },
  { t: 0.94, x: 0, y: -42, z: 4400, rx: 0, ry: 0, rz: 0, scale: 1.03 },
  { t: 1, x: 0, y: -20, z: 4590, rx: 0, ry: 0, rz: 0, scale: 1.05 },
];

let targetProgress = 0;
let currentProgress = 0;
let mouseX = 0;
let mouseY = 0;
let chapter2State = chapter2Root?.dataset.chapter2State || "entry";

function clamp(value, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

function lerp(from, to, amount) {
  return from + (to - from) * amount;
}

function getCamera(progress) {
  let start = cameraPath[0];
  let end = cameraPath[cameraPath.length - 1];

  for (let index = 0; index < cameraPath.length - 1; index += 1) {
    if (progress >= cameraPath[index].t && progress <= cameraPath[index + 1].t) {
      start = cameraPath[index];
      end = cameraPath[index + 1];
      break;
    }
  }

  const span = end.t - start.t || 1;
  const local = smoothstep(clamp((progress - start.t) / span));

  return {
    x: lerp(start.x, end.x, local),
    y: lerp(start.y, end.y, local),
    z: lerp(start.z, end.z, local),
    rx: lerp(start.rx, end.rx, local),
    ry: lerp(start.ry, end.ry, local),
    rz: lerp(start.rz, end.rz, local),
    scale: lerp(start.scale, end.scale, local),
  };
}

function readProgress() {
  const scrollyTop = scrollyDemo
    ? scrollyDemo.getBoundingClientRect().top + window.scrollY
    : 0;
  const scrollyHeight = scrollyDemo ? scrollyDemo.scrollHeight : document.documentElement.scrollHeight;
  const scrollMax = scrollyHeight - window.innerHeight;
  targetProgress = scrollMax > 0 ? clamp((window.scrollY - scrollyTop) / scrollMax) : 0;
}

function updateWorld(progress) {
  const camera = getCamera(progress);
  const mouseDriftX = mouseX * 18;
  const mouseDriftY = mouseY * 12;

  world.style.setProperty("--world-x", `${-(camera.x + mouseDriftX).toFixed(2)}px`);
  world.style.setProperty("--world-y", `${-(camera.y + mouseDriftY).toFixed(2)}px`);
  world.style.setProperty("--world-z", `${camera.z.toFixed(2)}px`);
  world.style.setProperty("--world-rx", `${camera.rx.toFixed(2)}deg`);
  world.style.setProperty("--world-ry", `${camera.ry.toFixed(2)}deg`);
  world.style.setProperty("--world-rz", `${camera.rz.toFixed(2)}deg`);
  world.style.setProperty("--world-scale", camera.scale.toFixed(4));

  root.style.setProperty("--progress", progress.toFixed(4));
  ribbon.style.transform = `scaleX(${progress.toFixed(4)})`;
}

function updateScenes(progress) {
  let activeIndex = 0;
  let activeDistance = Number.POSITIVE_INFINITY;

  scenes.forEach((scene, index) => {
    const point = Number.parseFloat(scene.dataset.point || "0");
    const distance = Math.abs(progress - point);
    let live = 0;

    // Each scene owns a separate enter, reading, and exit interval so the
    // next page cannot become visible before the current page has cleared.
    const scheduledLive = (enterStart, enterEnd, holdEnd, exitEnd) => {
      if (progress < enterStart) return 0;
      if (progress < enterEnd) {
        return smoothstep(clamp((progress - enterStart) / (enterEnd - enterStart)));
      }
      if (progress <= holdEnd) return 1;
      if (progress >= exitEnd) return 0;
      return 1 - smoothstep(clamp((progress - holdEnd) / (exitEnd - holdEnd)));
    };

    if (scene.classList.contains("scene--gate")) {
      live = scheduledLive(-0.01, 0, 0.13, 0.20);
    } else if (scene.classList.contains("scene--canyon")) {
      live = scheduledLive(0.18, 0.22, 0.39, 0.45);
    } else if (scene.classList.contains("scene--orbit")) {
      live = scheduledLive(0.40, 0.47, 0.62, 0.68);
    } else if (scene.classList.contains("scene--cabinet")) {
      live = scheduledLive(0.63, 0.72, 0.87, 0.95);

      const entryProgress = smoothstep(
        clamp((progress - 0.63) / 0.09)
      );
      const cabinetScale = progress < 0.63
        ? 0.72
        : 0.72 + entryProgress * 0.28;
      scene.style.setProperty("--cabinet-scale", cabinetScale.toFixed(3));
    } else if (scene.classList.contains("scene--horizon")) {
      live = scheduledLive(0.96, 0.985, 1, 1);
    }

    scene.style.setProperty("--scene-live", live.toFixed(3));
    scene.style.setProperty("--scene-near", clamp(1 - distance * 2.2).toFixed(3));
    scene.classList.toggle("is-near", distance < 0.18);

    if (distance < activeDistance) {
      activeDistance = distance;
      activeIndex = index;
    }
  });

  dots.forEach((dot, index) => {
    dot.classList.toggle("is-active", index === activeIndex);
  });
}

function updateLayers(progress) {
  layers.forEach((layer) => {
    const scene = layer.closest(".scene");
    const scenePoint = Number.parseFloat(scene?.dataset.point || "0");
    const depth = Number.parseFloat(layer.dataset.depth || "1");
    const distance = progress - scenePoint;
    const drift = Math.sin((progress * 2.4 + depth) * Math.PI) * depth;

    layer.style.setProperty("--layer-x", `${(-distance * depth * 120 + mouseX * depth * 20).toFixed(2)}px`);
    layer.style.setProperty("--layer-y", `${(drift * 8 + mouseY * depth * 16).toFixed(2)}px`);
    layer.style.setProperty("--layer-z", `${(distance * depth * 180).toFixed(2)}px`);
  });
}

function getSectionProgress(element) {
  if (!element) return 0;

  const rect = element.getBoundingClientRect();
  const scrollable = Math.max(1, element.offsetHeight - window.innerHeight);
  return clamp(-rect.top / scrollable);
}

function updateChapterTwoIntro() {
  if (!chapter2Intro) return;

  const progress = getSectionProgress(chapter2Intro);
  const titleLift = clamp((progress - 0.05) / 0.28);
  const titleFade = 1 - clamp((progress - 0.1) / 0.18);
  const chartProgress = clamp((progress - 0.44) / 0.24);
  const titleExitDistance = window.innerHeight * 0.86;

  chapter2Intro.style.setProperty("--chapter-title-y", `${(-titleExitDistance * titleLift).toFixed(1)}px`);
  chapter2Intro.style.setProperty("--chapter-title-opacity", titleFade.toFixed(3));
  chapter2Intro.style.setProperty("--chapter-chart-opacity", chartProgress.toFixed(3));
  chapter2Intro.style.setProperty("--chapter-chart-y", `${(52 * (1 - chartProgress)).toFixed(1)}px`);
}

function updateChapterReturn() {
  if (!chapter2Return) return;
  chapter2Return.classList.toggle("is-visible", chapter2State !== "entry");
}

function setChapter2State(nextState) {
  const states = new Set(["entry", "body-signals", "life-warning", "economic-cost"]);
  if (!chapter2Root || !states.has(nextState)) return;

  chapter2State = nextState;
  chapter2Root.dataset.chapter2State = nextState;
  updateChapterReturn();
  window.scrollTo({ top: chapter2Root.offsetTop, behavior: "auto" });
  readProgress();
}

function setupChapter2State() {
  if (!chapter2Root) return;

  chapter2Root.dataset.chapter2State = "entry";
  chapter2State = "entry";

  chapter2Targets.forEach((target) => {
    target.addEventListener("click", () => {
      setChapter2State(target.dataset.chapter2Target || "entry");
    });
  });

  chapter2Return?.addEventListener("click", (event) => {
    event.preventDefault();
    setChapter2State("entry");
  });
}

function updateLiStory() {
  if (!liStory || liFrames.length === 0) return;

  const progress = getSectionProgress(liStory);
  const p23Progress = liP23Section
    ? clamp((window.innerHeight * 0.84 - liP23Section.getBoundingClientRect().top) / (window.innerHeight * 0.32))
    : 0;
  const p23Opacity = p23Progress;
  const worldRect = liStoryWorld?.getBoundingClientRect();
  const worldFade = worldRect
    ? clamp((window.innerHeight * 0.76 - worldRect.bottom) / (window.innerHeight * 0.26))
    : 0;
  const focusY = window.innerHeight * 0.52;
  let activeIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  liSteps.forEach((step, index) => {
    const rect = step.getBoundingClientRect();
    const center = rect.top + rect.height * 0.5;
    const distance = Math.abs(center - focusY);

    if (rect.bottom > 0 && rect.top < window.innerHeight && distance < closestDistance) {
      closestDistance = distance;
      activeIndex = index;
    }
  });

  if (closestDistance === Number.POSITIVE_INFINITY) {
    activeIndex = Math.min(liFrames.length - 1, Math.floor(progress * liFrames.length));
  }

  liStory.style.setProperty("--story-progress", progress.toFixed(3));
  liStory.style.setProperty("--li-world-opacity", (1 - worldFade).toFixed(3));
  liStory.style.setProperty("--li-p23-opacity", p23Opacity.toFixed(3));
  liStory.style.setProperty("--li-p23-y", `${(20 * (1 - p23Opacity)).toFixed(1)}px`);
  liStory.dataset.activeStep = String(activeIndex);

  liFrames.forEach((frame, index) => {
    frame.classList.toggle("is-active", index === activeIndex);
  });

  liCopy.forEach((copy) => {
    const copyIndex = Number.parseInt(copy.dataset.liCopy || "-1", 10);
    copy.classList.toggle("is-active", copyIndex === activeIndex);
  });
}

function updateChapterTwo() {
  updateChapterTwoIntro();
  updateChapterReturn();
  updateLiStory();
}

function render() {
  const ease = reduceMotion ? 1 : 0.085;
  currentProgress = lerp(currentProgress, targetProgress, ease);

  if (Math.abs(currentProgress - targetProgress) < 0.0001) {
    currentProgress = targetProgress;
  }

  updateWorld(currentProgress);
  updateScenes(currentProgress);
  updateLayers(currentProgress);
  updateChapterTwo();

  window.requestAnimationFrame(render);
}

function handlePointerMove(event) {
  const rect = stage.getBoundingClientRect();
  mouseX = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
  mouseY = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
}

function startOpeningStory() {
  openingStory?.classList.add("is-playing");
}

function waitFor(duration) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, duration);
  });
}

function setupOpeningCover() {
  if (!openingCover || !enterButton) {
    document.body.classList.remove("cover-is-active");
    startOpeningStory();
    return;
  }

  const gifImage = openingCover.querySelector(".opening-cover__gif");
  const gifDuration = Number.parseInt(openingCover.dataset.gifDuration || "0", 10);
  let gifEndTimer;

  const showLastFrame = () => {
    gifEndTimer = window.setTimeout(() => {
      if (!openingCover.hidden) {
        openingCover.classList.add("has-ended");
      }
    }, gifDuration);
  };

  if (gifDuration > 0) {
    if (gifImage?.complete) {
      showLastFrame();
    } else {
      gifImage?.addEventListener("load", showLastFrame, { once: true });
    }
  }

  const enterCover = async () => {
    if (openingCover.classList.contains("is-entering")) return;

    const fadeDuration = reduceMotion ? 20 : 800;
    const holdDuration = reduceMotion ? 20 : 1000;

    window.clearTimeout(gifEndTimer);

    if (openingTransition) {
      openingTransition.hidden = false;
      window.requestAnimationFrame(() => {
        openingTransition.classList.add("is-visible");
      });
    }

    openingCover.classList.add("is-entering", "fade-out");

    await waitFor(fadeDuration);
    openingCover.hidden = true;

    if (openingTransition) {
      await waitFor(holdDuration);
      openingTransition.classList.remove("is-visible");
      await waitFor(fadeDuration);
      openingTransition.hidden = true;
    }

    document.body.classList.remove("cover-is-active");
    (firstContent || openingStory)?.scrollIntoView({ behavior: "auto", block: "start" });
    startOpeningStory();
  };

  enterButton.addEventListener("click", enterCover);
  enterButton.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    enterCover();
  });
}

function setupRevealObserver() {
  if (revealSections.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    revealSections.forEach((section) => section.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    },
    { threshold: 0.18 }
  );

  revealSections.forEach((section) => observer.observe(section));
}

function boot() {
  setupOpeningCover();
  setupChapter2State();
  setupRevealObserver();
  readProgress();
  currentProgress = targetProgress;
  updateWorld(currentProgress);
  updateScenes(currentProgress);
  updateLayers(currentProgress);
  updateChapterTwo();

  window.addEventListener("scroll", readProgress, { passive: true });
  window.addEventListener("resize", () => {
    readProgress();
  });
  stage.addEventListener("pointermove", handlePointerMove, { passive: true });
  stage.addEventListener("pointerleave", () => {
    mouseX = 0;
    mouseY = 0;
  });

  window.requestAnimationFrame(render);
  document.body.classList.add("is-ready");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
