// POINT ON RAY (CHATGPT)
function pointOnRay(rayOrigin, rayDir, point, tolerance = .75) {
  const vx = point.x - rayOrigin.x;
  const vy = point.y - rayOrigin.y;

  const t = vx * rayDir.x + vy * rayDir.y;
  if (t < 0) return false;

  const cx = rayOrigin.x + rayDir.x * t;
  const cy = rayOrigin.y + rayDir.y * t;

  const dx = point.x - cx;
  const dy = point.y - cy;

  return [(dx * dx + dy * dy) < tolerance * tolerance, (dx * dx + dy * dy)];
}

function rayIntersectsCellB(origin, dir, cellMin, cellMax) {
if (origin.y===cellMin.y) return true;

  const invDx = dir.x !== 0 ? 1 / dir.x : Infinity;
  const invDy = dir.y !== 0 ? 1 / dir.y : Infinity;

  let tmin = (cellMin.x - origin.x) * invDx;
  let tmax = (cellMax.x - origin.x) * invDx;

  if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

  let tymin = (cellMin.y - origin.y) * invDy;
  let tymax = (cellMax.y - origin.y) * invDy;

  if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

  if (tmin > tymax || tymin > tmax) return [false, tmin > tymax, tymin > tmax];

  const tHit = Math.max(tmin, tymin);

  return [tHit >= 0, tHit];
}

function rayIntersectsCellA(origin, dir, cellMin, cellMax) {
  const t1 = (cellMin.x - origin.x) / dir.x;
  const t2 = (cellMax.x - origin.x) / dir.x;
  const t3 = (cellMin.y - origin.y) / dir.y;
  const t4 = (cellMax.y - origin.y) / dir.y;

  const tmin = Math.max(
    Math.min(t1, t2),
    Math.min(t3, t4)
  );

  const tmax = Math.min(
    Math.max(t1, t2),
    Math.max(t3, t4)
  );

  // No intersection or behind ray
  if (tmax < 0 || tmin > tmax) return false;

  return [true, tmin, tmax];
}



const rayOrigin = {
  x:6,
  y:-6
 }; const O = rayOrigin;
const point = {
  x:6,
  y:-8
}; const P = point;
const rayDir = {
  x:(6 -O.x),
  y:(9 -O.y)
}; const D = rayDir;
const len = Math.hypot(D.x,D.y);
const norm = {
  x:D.x/len,
  y:D.y/len
}

const cellMin = { x:P.x, y:P.y };
const cellMax = { x:P.x+1, y:P.y+1 };

console.log( pointOnRay(rayOrigin, norm, point) )
console.log( rayIntersectsCellA(rayOrigin, rayDir, cellMin, cellMax) )
console.log( rayIntersectsCellB(rayOrigin, rayDir, cellMin, cellMax) )