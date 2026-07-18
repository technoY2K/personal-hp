const COLORS = ["#ffffff"] as const;

const SPARKLE_COUNT = 56;
const GLOW_CHANCE = 0.32;
const MIN_DURATION_MS = 1400;
const MAX_DURATION_MS = 2800;
const MAX_DELAY_MS = 500;

const SHOOTING_STAR_INTERVAL_MS = 2000;
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
  glowPhase: number;
  glowPeriodMs: number;
};

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createSparkles(width: number, height: number): Sparkle[] {
  const sparkles: Sparkle[] = [];

  for (let i = 0; i < SPARKLE_COUNT; i++) {
    const color = COLORS[Math.floor(Math.random() * COLORS.length)] ?? COLORS[0];
    // same x for start and end so they rise straight up
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
      glowPhase: randomBetween(0, Math.PI * 2),
      glowPeriodMs: randomBetween(2400, 4800),
    });
  }

  return sparkles;
}

function glowAmount(sparkle: Sparkle, now: number, animate: boolean): number {
  if (!sparkle.glows) return 0;
  if (!animate) return 0.55;

  const wave = Math.sin((now / sparkle.glowPeriodMs) * Math.PI * 2 + sparkle.glowPhase);
  return 0.25 + (wave + 1) * 0.35;
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
    ctx.shadowBlur = 6 + glow * 10;
    ctx.globalAlpha = 0.55 + glow * 0.45;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size * (1 + glow * 0.35), 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();
}

function createShootingStar(width: number, height: number, now: number): ShootingStar {
  const speed = randomBetween(0.5, 0.85); // px per ms
  const angle = randomBetween(Math.PI / 9, Math.PI / 5); // shallow dive below horizontal
  const direction = Math.random() < 0.5 ? 1 : -1;

  return {
    x: randomBetween(width * 0.1, width * 0.9),
    y: randomBetween(height * 0.05, height * 0.5),
    vx: Math.cos(angle) * speed * direction,
    vy: Math.sin(angle) * speed,
    born: now,
  };
}

// returns false once the star has burned out so it can be culled
function drawShootingStar(ctx: CanvasRenderingContext2D, star: ShootingStar, now: number): boolean {
  const age = now - star.born;
  const t = age / SHOOTING_STAR_LIFETIME_MS;
  if (t >= 1) return false;

  const x = star.x + star.vx * age;
  const y = star.y + star.vy * age;

  // quick fade in, longer fade out
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

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let { width, height } = resizeCanvas(canvas);
  let sparkles = createSparkles(width, height);
  let startTime: number | null = null;
  let settled = prefersReducedMotion;
  let frameId = 0;
  let shootingStars: ShootingStar[] = [];
  let lastShootingStarAt = 0;

  const paintFrame = (now: number, animateGlow: boolean) => {
    ctx.clearRect(0, 0, width, height);

    if (settled || prefersReducedMotion) {
      for (const sparkle of sparkles) {
        drawSparkle(
          ctx,
          sparkle.endX,
          sparkle.endY,
          sparkle.size,
          sparkle.color,
          glowAmount(sparkle, now, animateGlow),
        );
      }
      return true;
    }

    if (startTime === null) startTime = now;

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
      // start soft glow once a sparkle is mostly in place
      const glow = t > 0.85 ? glowAmount(sparkle, now, animateGlow) * ((t - 0.85) / 0.15) : 0;
      drawSparkle(ctx, x, y, sparkle.size, sparkle.color, glow);
    }

    if (allSettled) settled = true;
    return allSettled;
  };

  const tick = (now: number) => {
    paintFrame(now, !prefersReducedMotion);

    if (now - lastShootingStarAt >= SHOOTING_STAR_INTERVAL_MS) {
      shootingStars.push(createShootingStar(width, height, now));
      lastShootingStarAt = now;
    }
    shootingStars = shootingStars.filter((star) => drawShootingStar(ctx, star, now));

    frameId = requestAnimationFrame(tick);
  };

  const onResize = () => {
    const prevWidth = width;
    const prevHeight = height;
    ({ width, height } = resizeCanvas(canvas));

    for (const sparkle of sparkles) {
      const x = (sparkle.endX / prevWidth) * width;
      sparkle.startX = x;
      sparkle.endX = x;
      sparkle.startY = height + randomBetween(4, 28);
      sparkle.endY = (sparkle.endY / prevHeight) * height;
    }

    if (!settled) {
      cancelAnimationFrame(frameId);
      startTime = null;
      frameId = requestAnimationFrame(tick);
    }
  };

  window.addEventListener("resize", onResize);

  if (prefersReducedMotion) {
    paintFrame(0, false);
    return;
  }

  frameId = requestAnimationFrame(tick);
}
