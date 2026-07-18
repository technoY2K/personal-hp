const COLORS = ["#ffffff"] as const;

const SPARKLE_COUNT = 56;
const GLOW_CHANCE = 0.32;
const MIN_DURATION_MS = 1400;
const MAX_DURATION_MS = 2800;
const MAX_DELAY_MS = 500;

const SHOOTING_STAR_MIN_GAP_MS = 3000;
const SHOOTING_STAR_MAX_GAP_MS = 6000;
const SHOOTING_STAR_LIFETIME_MS = 900;
const SHOOTING_STAR_TRAIL_PX = 110;

type ShootingStar = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
};

type Sparkle = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  glows: boolean;
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function prefersStaticSparkles(): boolean {
  return (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(max-width: 767px)").matches
  );
}

function createSparkles(width: number, height: number): Sparkle[] {
  const sparkles: Sparkle[] = [];

  for (let i = 0; i < SPARKLE_COUNT; i++) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0];
    const x = randomBetween(0, width);

    sparkles.push({
      startX: x,
      startY: height + randomBetween(4, 28),
      endX: x,
      endY: randomBetween(height * 0.05, height * 0.92),
      color,
      size: randomBetween(1, 2.4),
      delay: randomBetween(0, MAX_DELAY_MS),
      duration: randomBetween(MIN_DURATION_MS, MAX_DURATION_MS),
      glows: Math.random() < GLOW_CHANCE,
    });
  }

  return sparkles;
}

function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  glow: number,
): void {
  if (glow > 0) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * 1.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function createShootingStar(width: number, height: number, now: number): ShootingStar {
  const speed = randomBetween(0.5, 0.85);
  const angle = randomBetween(Math.PI / 9, Math.PI / 5);
  const direction = Math.random() < 0.5 ? 1 : -1;

  return {
    x: randomBetween(width * 0.1, width * 0.9),
    y: randomBetween(height * 0.05, height * 0.45),
    vx: Math.cos(angle) * speed * direction,
    vy: Math.sin(angle) * speed,
    born: now,
  };
}

// returns false once the star has burned out
function drawShootingStar(ctx: CanvasRenderingContext2D, star: ShootingStar, now: number): boolean {
  const age = now - star.born;
  const t = age / SHOOTING_STAR_LIFETIME_MS;
  if (t >= 1) return false;

  const x = star.x + star.vx * age;
  const y = star.y + star.vy * age;
  const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;

  const speed = Math.hypot(star.vx, star.vy);
  const tailX = x - (star.vx / speed) * SHOOTING_STAR_TRAIL_PX;
  const tailY = y - (star.vy / speed) * SHOOTING_STAR_TRAIL_PX;

  const gradient = ctx.createLinearGradient(x, y, tailX, tailY);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.save();
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 1.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(tailX, tailY);
  ctx.stroke();

  ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
  ctx.beginPath();
  ctx.arc(x, y, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  return true;
}

function resizeCanvas(canvas: HTMLCanvasElement): { width: number; height: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  return { width, height };
}

export function initSparkles(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let staticMode = prefersStaticSparkles();
  let { width, height } = resizeCanvas(canvas);
  let sparkles = createSparkles(width, height);
  let startTime: number | null = null;
  let settled = staticMode;
  let frameId = 0;
  let starTimerId = 0;
  let activeStar: ShootingStar | null = null;

  const paintSettled = () => {
    ctx.clearRect(0, 0, width, height);
    for (const sparkle of sparkles) {
      const glow = !staticMode && sparkle.glows ? 1 : 0;
      drawSparkle(ctx, sparkle.endX, sparkle.endY, sparkle.size, sparkle.color, glow);
    }
  };

  const clearStarTimer = () => {
    window.clearTimeout(starTimerId);
    starTimerId = 0;
  };

  const stopAnimation = () => {
    cancelAnimationFrame(frameId);
    frameId = 0;
    activeStar = null;
  };

  const scheduleNextShootingStar = () => {
    if (staticMode || !settled) return;

    clearStarTimer();
    const delay = randomBetween(SHOOTING_STAR_MIN_GAP_MS, SHOOTING_STAR_MAX_GAP_MS);
    starTimerId = window.setTimeout(() => {
      if (staticMode || !settled) return;
      activeStar = createShootingStar(width, height, performance.now());
      frameId = requestAnimationFrame(starTick);
    }, delay);
  };

  const starTick = (now: number) => {
    if (!activeStar || staticMode) {
      activeStar = null;
      paintSettled();
      return;
    }

    paintSettled();
    const alive = drawShootingStar(ctx, activeStar, now);

    if (!alive) {
      activeStar = null;
      paintSettled();
      scheduleNextShootingStar();
      return;
    }

    frameId = requestAnimationFrame(starTick);
  };

  const tick = (now: number) => {
    if (startTime === null) startTime = now;

    ctx.clearRect(0, 0, width, height);

    let allSettled = true;
    const elapsed = now - startTime;

    for (const sparkle of sparkles) {
      const local = elapsed - sparkle.delay;
      let t = 1;

      if (local < 0) {
        allSettled = false;
        continue;
      }

      if (local < sparkle.duration) {
        t = easeOutCubic(local / sparkle.duration);
        allSettled = false;
      }

      const x = sparkle.startX + (sparkle.endX - sparkle.startX) * t;
      const y = sparkle.startY + (sparkle.endY - sparkle.startY) * t;
      const glow = sparkle.glows && t > 0.85 ? (t - 0.85) / 0.15 : 0;
      drawSparkle(ctx, x, y, sparkle.size, sparkle.color, glow);
    }

    if (allSettled) {
      settled = true;
      paintSettled();
      scheduleNextShootingStar();
      return;
    }

    frameId = requestAnimationFrame(tick);
  };

  const rescaleSparkles = (prevWidth: number, prevHeight: number) => {
    for (const sparkle of sparkles) {
      const x = (sparkle.endX / prevWidth) * width;
      sparkle.startX = x;
      sparkle.endX = x;
      sparkle.startY = height + randomBetween(4, 28);
      sparkle.endY = (sparkle.endY / prevHeight) * height;
    }
  };

  const onResize = () => {
    const prevWidth = width;
    const prevHeight = height;
    const nextStatic = prefersStaticSparkles();
    ({ width, height } = resizeCanvas(canvas));
    rescaleSparkles(prevWidth, prevHeight);

    stopAnimation();
    clearStarTimer();

    if (nextStatic) {
      staticMode = true;
      settled = true;
      paintSettled();
      return;
    }

    if (staticMode && !nextStatic) {
      staticMode = false;
      settled = false;
      startTime = null;
      frameId = requestAnimationFrame(tick);
      return;
    }

    staticMode = false;

    if (settled) {
      paintSettled();
      scheduleNextShootingStar();
      return;
    }

    startTime = null;
    frameId = requestAnimationFrame(tick);
  };

  window.addEventListener("resize", onResize);

  if (staticMode) {
    paintSettled();
    return;
  }

  frameId = requestAnimationFrame(tick);
}
