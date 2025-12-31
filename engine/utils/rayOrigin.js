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


// FUNCTIONAL TEST CONFIG
async function testPhaser() {
    console.log('##########################################################');
    [p1,p2].forEach(px=>px.board.mode('dissable-subspace'));
    const delay=()=>new Promise((resolve)=>setTimeout(()=>resolve(),45))

    const input = {
        originBoard: 1,
        oppositeBoard: 2,
        originCell: '1821',
        targetCell: '1208',
        testCell: '1109'
    };
    await new Promise((resolve,reject)=>{
        headerEl.textContent = "set originCell";
        document.addEventListener('keypress', (e)=>{e.key==='q' && reject()})
        let count = 0;
        document.querySelector('main').addEventListener('click', (e)=>{
            if (!e.target.classList.contains('cell')) return;
            const elements = document.elementsFromPoint(e.clientX,e.clientY)
            if (count===0 && elements.includes(p1.board)) {input.originBoard = 1; input.oppositeBoard = 2};
            if (count===0 && elements.includes(p2.board)) {input.originBoard = 2; input.oppositeBoard = 1};
            switch (count) {
                case 0: {input.originCell = e.target.id; count++; headerEl.textContent = "set targetCell"}; break;
                case 1: {input.targetCell = e.target.id; count++; headerEl.textContent = "set testCell"}; break;
                case 2: {input.testCell = e.target.id; count++; headerEl.textContent = "Calculating. . ."}; break;
            }
            e.target.classList.add('targetedCell');
            if (count === 3) resolve();
        });
    });
    // console.log("SENT: ", input.originBoard, input.originCell, input.targetCell, input.testCell)
    const call = rayIntersect(input.oppositeBoard, input.targetCell, input.originCell, input.testCell);
    // if (call) {cells[input.testCell].target.classList.add('hitCell',  'phaseCannon')
    // } else cells[input.testCell].target.classList.add('missCell',  'phaseCannon')
    
    let cells =  p1.board.cells; let cell;
    for (cell in cells) {
        if (rayIntersect(2, input.originCell, input.targetCell, cell)) {
            cells[cell].target.classList.add('hitCell',  'phaseCannon');
            await delay();
        }
    }
    cells[input.originCell].target.classList.replace('hitCell', 'missCell');

    cells =  p2.board.cells;
    for (cell in cells) {
        if (rayIntersect(1, input.originCell, input.targetCell, cell)) {
            cells[cell].target.classList.add('hitCell',  'phaseCannon');
            await delay();
        }
    }

    cells[input.testCell].target.classList.remove('hitCell');
    cells[input.testCell].target.classList.add('impededCell');
    cells[input.targetCell].target.classList.replace('hitCell', 'targetedCell');

    headerEl.textContent = call;
    cells =  Object.values(p2.ships).map(ship=>ship.location[1]).flat();
    for (cell of cells) {
        if (rayIntersect(1, input.originCell, input.targetCell, cell.key)) cell.target.classList.replace('hitCell',  'impededCell')
        // if (rayIntersect(input.oppositeBoard, input.targetCell, input.originCell, cell)) cells[cell].target.classList.add('hitCell',  'phaseCannon')
    }
}

function rayIntersectsCellB(origin, dir, cellMin, cellMax) {
// if (origin.col===cellMin.col) return true;

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

function rayIntersectsCell(origin, dir, cellMin, cellMax) {
  const t1 = (cellMin.row - origin.row) / dir.row;
  const t2 = (cellMax.row - origin.row) / dir.row;
  const t3 = (cellMin.col - origin.col) / dir.col;
  const t4 = (cellMax.col - origin.col) / dir.col;

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

function rayIntersect(originBoardNum, origin, target, testPoint) {
  // console.log("RECEIVED: ", originBoardNum, origin, target, testPoint)
  const parse = (strNum) => Object({ row: Number(strNum.slice(0,2)), col: Number(strNum.slice(-2)) });

  const p1ToGlobal = (obj) => Object({ row:26-obj.row, col:obj.col });
  const p2ToGlobal = (obj) => Object({ row:26+obj.row, col:26-obj.col });

  console.log("LOCAL: ", parse(origin), parse(target))
  console.log("GLOBAL", p1ToGlobal(parse(origin)), p2ToGlobal(parse(target)))

  const len = (obj) => Math.hypot(obj.row, obj.col);
  const norm = (obj) => Object({ row:obj.row / len(obj), col:obj.col / len(obj) });

  const rayDir = () => {
    return originBoardNum===1 && norm( Object({ 
      row:(p2ToGlobal(parse(target)).row - p1ToGlobal(parse(origin)).row), 
      col:(p2ToGlobal(parse(target)).col - p1ToGlobal(parse(origin)).col) }) ) ||
    originBoardNum===2 && norm( Object({ 
      row:-(p2ToGlobal(parse(target)).row - (p1ToGlobal(parse(origin)).row)), 
      col:-((p2ToGlobal(parse(target)).col) - (p1ToGlobal(parse(origin)).col)) }) )
  }

  // console.log(rayDir())

  const cellMin = () => {
    return originBoardNum===1 && Object({ 
      row:p2ToGlobal(parse(testPoint)).row, 
      col:p2ToGlobal(parse(testPoint)).col }) ||
    originBoardNum===2 && Object({ 
      row:p2ToGlobal(parse(testPoint)).row, 
      col:p2ToGlobal(parse(testPoint)).col })
  }

  const cellMax = () => {
    return originBoardNum===1 && Object({ 
      row:p2ToGlobal(parse(testPoint)).row + 1, 
      col:p2ToGlobal(parse(testPoint)).col + 1 }) ||
    originBoardNum===2 && Object({ 
      row:p2ToGlobal(parse(testPoint)).row + 1, 
      col:p2ToGlobal(parse(testPoint)).col + 1 })
  }

  // console.log("PROPS: ", p1ToGlobal(parse(origin)), rayDir(), cellMin(), cellMax());

  return originBoardNum===1 && rayIntersectsCellB( p1ToGlobal(parse(origin)), rayDir(), cellMin(), cellMax() ) || 
         originBoardNum===2 && rayIntersectsCellB( p2ToGlobal(parse(origin)), rayDir(), cellMin(), cellMax() )
}