// Footer drawings copied from src/components/paper/FooterArt.tsx (ridges, contours).
const WIDTH = 1000, round = v => Math.round(v * 10) / 10;
const RIDGE_LINES = 11, RIDGE_MARK = 6, CONTOUR_LINES = 8;
function ridgePath(index, time) {
  const base = 36 + index * 14; let d = '';
  for (let x = -12; x <= WIDTH + 12; x += 8) {
    const u = x / WIDTH;
    const first = Math.exp(-(((u - (0.3 + 0.12 * Math.sin(time * 0.4 + index * 0.5))) / 0.09) ** 2)) * (18 + index * 1.5);
    const second = Math.exp(-(((u - (0.68 + 0.1 * Math.cos(time * 0.3 + index * 0.4))) / 0.07) ** 2)) * (10 + (RIDGE_LINES - index) * 1.6);
    const y = base - first - second + Math.sin(x * 0.04 + time * 1.5 + index);
    d += `${x < -8 ? 'M' : 'L'}${x} ${round(y)}`;
  }
  return `${d}L${WIDTH + 12} 230L-12 230Z`;
}
function contourPath(index, time) {
  const ring = index % CONTOUR_LINES, second = index >= CONTOUR_LINES;
  const cx = second ? 700 + Math.sin(time * 0.2) * 18 : 300 + Math.cos(time * 0.25) * 16;
  const cy = second ? 112 : 98, radius = 14 + ring * (second ? 15 : 19); let d = '';
  for (let step = 0; step <= 64; step += 1) {
    const a = (step / 64) * Math.PI * 2;
    const r = radius * (1 + 0.13 * Math.sin(a * 3 + time * 0.5 + ring * 0.5 + (second ? 2 : 0)) + 0.08 * Math.cos(a * 2 - time * 0.35 + ring * 0.3));
    d += `${step ? 'L' : 'M'}${round(cx + Math.cos(a) * r * 2.3)} ${round(cy + Math.sin(a) * r * 0.62)}`;
  }
  return `${d}Z`;
}
const KINDS = {
  ridges: { count: RIDGE_LINES, path: ridgePath, cls: i => i === RIDGE_MARK ? 'ln ridge mark' : `ln ridge${i < 4 ? ' far' : ''}` },
  contours: { count: CONTOUR_LINES * 2, path: contourPath, cls: i => i === 3 ? 'ln mark amber' : i === CONTOUR_LINES + 5 ? 'ln mark teal' : 'ln far' },
};
window.waves = [...document.querySelectorAll('svg[data-wave]')].map(svg => {
  const k = KINDS[svg.dataset.wave];
  const paths = Array.from({ length: k.count }, (_, i) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('class', k.cls(i)); p.setAttribute('d', k.path(i, 0)); svg.appendChild(p); return p;
  });
  return t => paths.forEach((p, i) => p.setAttribute('d', k.path(i, t + 3)));
});
