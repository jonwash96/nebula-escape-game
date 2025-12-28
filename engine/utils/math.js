import { config } from "../../game/config.js";

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
function rayIntersectsCell(origin, dir, cellMin, cellMax) {
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

  return true;
}

// Handmade Parser for AI built function
function rayIntersect(originBoardNum, origin, target, testPoint) {
  const parse = (strNum) => Object({ x: Number(strNum.slice(0,2)), y: Number(strNum.slice(-2)) });

  const p1ToGlobal = (obj) => Object({ x:obj.x, y: - obj.y });
  const p2ToGlobal = (obj) => Object({ x:obj.x, y: config.boardSize - obj.y + 1 });

  const len = (obj) => Math.hypot(obj.x, obj.y);
  const norm = (obj) => Object({ x:obj.x / len(obj.x), y:obj.y / len(obj.y) });

  const rayDir = () => {
    return originBoardNum===1 && norm( Object({ 
      x:p1ToGlobal(parse(target)).x - p1ToGlobal(parse(origin)).x, 
      y:p1ToGlobal(parse(target)).y - p1ToGlobal(parse(origin)).y }) ) ||
    originBoardNum===2 && norm( Object({ 
      x:p2ToGlobal(parse(target)).x - p2ToGlobal(parse(origin)).x, 
      y:p2ToGlobal(parse(target)).y - p2ToGlobal(parse(origin)).y }) )
  }

  const cellMin = () => {
    return originBoardNum===1 && Object({ x:p1ToGlobal(parse(testPoint)).x, y:p1ToGlobal(parse(testPoint)).y }) ||
           originBoardNum===2 && Object({ x:p2ToGlobal(parse(testPoint)).x, y:p2ToGlobal(parse(testPoint)).y })
  }

  const cellMax = () => {
    return originBoardNum===1 && Object({ x:p1ToGlobal(parse(testPoint)).x + 1, y:p1ToGlobal(parse(testPoint)).y + 1 }) ||
           originBoardNum===2 && Object({ x:p2ToGlobal(parse(testPoint)).x + 1, y:p2ToGlobal(parse(testPoint)).y + 1 })
  }

  return originBoardNum===1 && rayIntersectsCell( p1ToGlobal(parse(origin)), rayDir(), cellMin(), cellMax() ) || 
         originBoardNum===2 && rayIntersectsCell( p2ToGlobal(parse(origin)), rayDir(), cellMin(), cellMax() )
}

export { parallax, remap, rayIntersect, cellDistance, parse };


