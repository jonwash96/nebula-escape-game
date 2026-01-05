const parse = (strNum) => Object({ x: Number(strNum.slice(0,2)), y: Number(strNum.slice(-2)) });

const cellDistance = (originCell, cell) => Math.hypot(parse(cell).x - parse(originCell).x, parse(cell).y - parse(originCell).y)

// linear remap with clamped endpoints (ChatGPT)
function parallax(input) {
  const clamped = Math.max(0, Math.min(100, input));
  return 0.75 * clamped + 12.5;
}
// linear remap with clamped endpoints (ChatGPT)
function remap(value, inMin, inMax, outMin, outMax) {
  return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
  // Call: remap(x, 0, 100, 12.5, 87.5);
}

// POINT INTERSECTS RAY (CHATGPT)
function rayIntersectsCellB(origin, dir, cellMin, cellMax) {
if (origin.col===cellMin.col) return true;

  const invDx = dir.row !== 0 ? 1 / dir.row : Infinity;
  const invDy = dir.col !== 0 ? 1 / dir.col : Infinity;

  let tmin = (cellMin.row - origin.row) * invDx;
  let tmax = (cellMax.row - origin.row) * invDx;

  if (tmin > tmax) [tmin, tmax] = [tmax, tmin];

  let tymin = (cellMin.col - origin.col) * invDy;
  let tymax = (cellMax.col - origin.col) * invDy;

  if (tymin > tymax) [tymin, tymax] = [tymax, tymin];

  if (tmin > tymax || tymin > tmax) return false;

  const tHit = Math.max(tmin, tymin);

  return tHit >= 0;
}

// HANDMADE PARSER FOR AI BUILT RAY-INTERSECT FUNCTION
function rayIntersect(targetBoardNum, origin, target, testPoint) {
  const parse = (strNum) => Object({
    row: Number(strNum.slice(0,2)),
    col: Number(strNum.slice(-2)) });

  const p1ToGlobal = (obj) => Object({ row:26-obj.row, col:obj.col });
  const p2ToGlobal = (obj) => Object({ row:26+obj.row, col:26-obj.col });

  const len = (obj) => Math.hypot(obj.row, obj.col);
  const norm = (obj) => Object({ row:obj.row / len(obj), col:obj.col / len(obj) });

  const rayDir = () => {
    return targetBoardNum===1 && norm( Object({
      row:(p2ToGlobal(parse(target)).row - p1ToGlobal(parse(origin)).row),
      col:(p2ToGlobal(parse(target)).col - p1ToGlobal(parse(origin)).col) }) ) ||
    targetBoardNum===2 && norm( Object({
      row:-(p2ToGlobal(parse(target)).row - (p1ToGlobal(parse(origin)).row)),
      col:-((p2ToGlobal(parse(target)).col) - (p1ToGlobal(parse(origin)).col)) }) )
  }

  const cellMin = () => {
    return targetBoardNum===1 && Object({
      row:p2ToGlobal(parse(testPoint)).row,
      col:p2ToGlobal(parse(testPoint)).col }) ||
    targetBoardNum===2 && Object({
      row:p2ToGlobal(parse(testPoint)).row,
      col:p2ToGlobal(parse(testPoint)).col })
  }

  const cellMax = () => {
    return targetBoardNum===1 && Object({
      row:p2ToGlobal(parse(testPoint)).row + 1,
      col:p2ToGlobal(parse(testPoint)).col + 1 }) ||
    targetBoardNum===2 && Object({
      row:p2ToGlobal(parse(testPoint)).row + 1,
      col:p2ToGlobal(parse(testPoint)).col + 1 })
  }

  return targetBoardNum===1
    && rayIntersectsCellB( p1ToGlobal(parse(origin)), rayDir(), cellMin(), cellMax() ) ||
    targetBoardNum===2
      && rayIntersectsCellB( p2ToGlobal(parse(origin)), rayDir(), cellMin(), cellMax() )
}

export { parallax, remap, rayIntersect, cellDistance, parse };
